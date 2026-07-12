# Deploy to Kubernetes

Source: https://laradock.io/docs/deploy-to-kubernetes

Built your app with [Laradock](https://laradock.io/docs/Intro)? Ship it to **Kubernetes** without changing your stack. `./laradock ship` builds one self-contained image (nginx + php-fpm, serving `$PORT`); your cluster just runs it, whether that's your own, **EKS**, **GKE**, **AKS**, or **DOKS**.

## 1. Build and push the image

```bash
./laradock ship registry.example.com/you/app:1.0 --push
```

## 2. Apply the manifests

Laradock ships a ready [`kubernetes.yaml`](https://github.com/laradock/laradock/blob/master/production/kubernetes.yaml): a deployment (resource limits + probes), a service, a TLS-ready ingress (cert-manager), an uploads PVC, plus optional worker, scheduler CronJob, and migrate Job.

```bash
kubectl create secret generic app-env --from-env-file=laradock/production/.env
# set image: to your pushed image in kubernetes.yaml, then:
kubectl apply -f laradock/production/kubernetes.yaml
```

## Notes

- **Managed database.** Point `DB_*` / `REDIS_*` at RDS, Cloud SQL, or your provider's managed service, never a pod.
- **TLS.** Install [cert-manager](https://cert-manager.io) and set your issuer in the ingress annotations.
- **Uploads.** Multiple replicas need `ReadWriteMany` storage or S3 (see the PVC note in the manifest).

Deploying elsewhere? The [full deploy guide](https://laradock.io/docs/production) covers every target, ECS, Cloud Run, Fly, Render, and more.
