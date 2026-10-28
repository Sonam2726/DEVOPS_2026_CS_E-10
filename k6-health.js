
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
};

export default function () {
  const response = http.get('http://localhost:30081/api/health');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'database is connected': (r) =>
      r.body.includes('"database":"connected"'),
  });

  sleep(1);
}
