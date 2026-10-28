# SkillBridge local Kubernetes deployment

These manifests are for local development and learning with Docker Desktop
Kubernetes or Minikube. They are not production-ready: MongoDB is a single
replica with local storage, authentication is not configured for MongoDB, and
the services use fixed NodePorts instead of an Ingress.

The manifests do not read a local `.env` file. The backend receives non-secret
settings from `configmap.yaml` and requires a separately created
`skillbridge-secrets` Secret containing `JWT_SECRET`.

## Prerequisites

- Docker Desktop with Kubernetes enabled, or Minikube with `kubectl`
- Docker and access to the repository root
- A locally running Ollama installation if AI Tutor testing is required
- The `llama3.2:1b` model pulled into Ollama:

  ```powershell
  ollama pull llama3.2:1b
  ```

Check the selected cluster before deploying:

```powershell
kubectl config current-context
kubectl get nodes
```

## Build the local images

The existing Dockerfiles are reused. The frontend API URL is embedded during
the Vite build, so it must be a URL the browser can reach. With these
NodePorts, that URL is `http://localhost:30081/api`.

```powershell
docker build -t skillbridge-backend:local .\server
docker build `
  --build-arg VITE_API_URL=http://localhost:30081/api `
  -t skillbridge-frontend:local .\client
```

Docker Desktop Kubernetes can use these local images directly. For Minikube,
load them into the cluster after building:

```powershell
minikube image load skillbridge-backend:local
minikube image load skillbridge-frontend:local
```

If you use another image registry or tag, update the `images` section in
`kustomization.yaml` or replace the image names in the Deployment manifests.
Do not use `latest` for this local workflow unless you also manage pull policy
and image refreshes deliberately.

## Create the local JWT Secret

Use a new local-only value. Do not commit the generated Secret or a real
production credential:

```powershell
$jwtSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
kubectl create namespace skillbridge --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret generic skillbridge-secrets `
  --namespace skillbridge `
  --from-literal=JWT_SECRET=$jwtSecret `
  --dry-run=client -o yaml | kubectl apply -f -
```

`secret.example.yaml` documents the expected Secret shape but is intentionally
not included by `kustomization.yaml`, so a placeholder cannot be deployed by
accident.

## Apply the manifests

```powershell
kubectl apply -k .\k8s
kubectl -n skillbridge rollout status deployment/mongodb --timeout=180s
kubectl -n skillbridge rollout status deployment/backend --timeout=180s
kubectl -n skillbridge rollout status deployment/frontend --timeout=180s
```

Inspect the resources and logs:

```powershell
kubectl -n skillbridge get pods,svc,pvc
kubectl -n skillbridge describe pod -l app.kubernetes.io/name=backend
kubectl -n skillbridge logs deployment/backend
kubectl -n skillbridge logs deployment/frontend
kubectl -n skillbridge get events --sort-by=.lastTimestamp
```

The PVC must become `Bound` before MongoDB can become ready. The MongoDB
service is `ClusterIP` only and is not exposed outside the cluster.

## Access the application

With Docker Desktop Kubernetes:

- Frontend: <http://localhost:30080>
- Backend health: <http://localhost:30081/api/health>

With Minikube, use the service helper if direct NodePort access is not
available:

```powershell
minikube service frontend --namespace skillbridge --url
minikube service backend --namespace skillbridge --url
```

If those commands return non-local or dynamically allocated URLs, use the
returned frontend URL as the browser origin and the returned backend URL as the
browser API base URL. Update `CLIENT_URL` in `configmap.yaml` to the exact
frontend origin, then rebuild the frontend with the exact backend URL:

```powershell
docker build `
  --build-arg VITE_API_URL=http://<backend-url>/api `
  -t skillbridge-frontend:local .\client
minikube image load skillbridge-frontend:local
kubectl apply -k .\k8s
kubectl -n skillbridge rollout restart deployment/backend
kubectl -n skillbridge rollout restart deployment/frontend
```

The frontend cannot call `http://backend:5000` directly from browser code:
Kubernetes service DNS is available to containers, not to the user's browser.
That is why the frontend image is built with the browser-reachable backend
NodePort URL.

## Ollama limitation

The backend is configured with `OLLAMA_URL=http://host.docker.internal:11434`,
matching the existing Compose setup. This may work with Docker Desktop
Kubernetes, but it is not guaranteed for every Minikube driver or host
network. Minikube may require a host-reachable address or a separate Ollama
deployment. Do not treat AI Tutor as working until this check succeeds:

```powershell
kubectl -n skillbridge exec deployment/backend -- node -e "fetch(process.env.OLLAMA_URL + '/api/tags').then(r => { console.log(r.status); process.exit(r.ok ? 0 : 1); }).catch(error => { console.error(error.message); process.exit(1); })"
```

The current application selects `llama3.2:1b` in backend code; this manifest
does not change that model selection.

## Updating images

Rebuild with the same local tags, load the images into Minikube when needed,
then restart the workloads:

```powershell
docker build -t skillbridge-backend:local .\server
docker build `
  --build-arg VITE_API_URL=http://localhost:30081/api `
  -t skillbridge-frontend:local .\client
minikube image load skillbridge-backend:local
minikube image load skillbridge-frontend:local
kubectl -n skillbridge rollout restart deployment/backend deployment/frontend
kubectl -n skillbridge rollout status deployment/backend --timeout=180s
kubectl -n skillbridge rollout status deployment/frontend --timeout=180s
```

When `VITE_API_URL` changes, rebuilding the frontend image is required.

## Validation and cleanup

Validate rendered YAML without changing the cluster:

```powershell
kubectl kustomize .\k8s
kubectl apply --dry-run=client -k .\k8s
```

For cleanup that preserves MongoDB data, remove only the application
Deployments, Services, ConfigMap, and Namespace if desired. Do not delete the
`mongodb-data` PVC unless you intentionally want to delete the local database:

```powershell
kubectl -n skillbridge delete deployment backend frontend mongodb
kubectl -n skillbridge delete service backend frontend mongodb
kubectl -n skillbridge delete configmap skillbridge-backend-config
```

The namespace and PVC are deliberately left in place by the commands above.
Never use `docker compose down -v` or delete the PVC for routine cleanup.
