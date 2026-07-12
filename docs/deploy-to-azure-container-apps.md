# Deploy to Azure Container Apps

Source: https://laradock.io/docs/deploy-to-azure-container-apps

Built your app with [Laradock](https://laradock.io/docs/Intro)? Ship it to **Azure Container Apps** without changing your stack. `./laradock ship` builds one self-contained image (nginx + php-fpm) that Container Apps runs on port 8080 with autoscaling.

## 1. Build and push to ACR

```bash
az acr create -g <RG> -n <REGISTRY> --sku Basic
./laradock ship <REGISTRY>.azurecr.io/laradock-app:latest --push
```

## 2. Create the app

Laradock ships a ready [`azure-container-app.yaml`](https://github.com/laradock/laradock/blob/master/production/providers/azure-container-app.yaml) (ingress `targetPort: 8080`, secrets, scale rules). Fill in your image, then:

```bash
az containerapp create -g <RG> -n laradock-app \
  --environment <MANAGED_ENV> --yaml laradock/production/providers/azure-container-app.yaml
```

## Notes

- **Managed database.** Use **Azure Database for MySQL/PostgreSQL** and **Azure Cache for Redis**.
- **Secrets** map to Container Apps secrets (or Key Vault), never bake them into the image.
- **Scaling.** Tune `minReplicas` / `maxReplicas` (KEDA-based) in the YAML.

Deploying elsewhere? The [full deploy guide](https://laradock.io/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Fly, and more.
