# Dillinger + Kubernetes

Some tips on how to deploy Dillinger to a Kubernetes cluster....

NOTE: This document assumes you've successfully created a cluster on GCP and you have a GCP account with a project associated with the cluster.

# Setups

Create the replication controller and the service running Dillinger.  These are already in the root of the directory in your `dillinger.k8s.dev.yml` file.  Feel free to modify as you see fit.

We use [N|Solid](https://nodesource.com/products/nsolid) as the Node.js runtime as it is the most robust/enterprise-grade Node.js platform.

Head here and follow the steps for using the N|Solid Docker Image with Kubernetes.

https://github.com/nodesource/nsolid-kubernetes

First create the deployment files, one for dev and one for production

```sh
kubectl create -f dillinger.k8s.dev.yml
kubectl create -f dillinger.k8s.production.yml
```

If you get an error remove the section for `secrets` and `volumeMounts`.

Check the status of the pods

```sh
kubectl get pods
```

Get the IP address of your Dillinger app

```sh
gcloud compute forwarding-rules list
```

Should output something like....

```
$ gcloud compute forwarding-rules list
NAME     REGION        IP_ADDRESS       IP_PROTOCOL TARGET
abcdef   us-central1   104.197.XXX.XXX  TCP         us-xxxx
```

##### To update a running cluster...

Say you cloned the latest update.  You want this to roll out to your dev environment.  Clone the repo then simply run:

```sh
kubectl replace -f dillinger.k8s.dev.yml
```

## Create Secrets to Expose Plugin Configs

We now want to be able to expose our configs like Dropbox and Github.  Instead of using environment variables we'll use the `dropbox-config.json` (and others) file which contains sensitive information.  That's why we use [Kubernetes Secrets](http://kubernetes.io/docs/user-guide/secrets/#creating-your-own-secrets) to protect it.

In the root of the Dillinger project directory, run:

```sh
kubectl create secret generic dropbox-config --from-file=configs/dropbox/dropbox-config.json --namespace=dillinger-dev
kubectl create secret generic dropbox-config --from-file=configs/dropbox/dropbox-config.json --namespace=dillinger-prod
```

Should output:

```sh
secret "dropbox-config" created
```

Check to see it was created

```sh
kubectl get secrets
```

Should output something like:

```
NAME                  TYPE                                  DATA      AGE
dropbox-config        Opaque                                1         1m
```

You'll need to add the secret and mount it in the virtual filesystem on your pods.s

```sh
vim dillinger.k8s.dev.yml
```
Make the changes there and repeat for each plugin.

Here's a shortcut or it's in the `kube-secrets.sh` file:

```sh
kubectl create secret generic dropbox-config --from-file=configs/dropbox/dropbox-config.json --namespace=dillinger-dev
kubectl create secret generic github-config --from-file=configs/github/github-config.json --namespace=dillinger-dev
kubectl create secret generic onedrive-config --from-file=configs/onedrive/onedrive-config.json --namespace=dillinger-dev
kubectl create secret generic googledrive-config --from-file=configs/googledrive/googledrive-config.json --namespace=dillinger-dev
kubectl create secret generic sponsored-config --from-file=configs/sponsored/sponsored-config.json --namespace=dillinger-dev
kubectl create secret generic dropbox-config --from-file=configs/dropbox/dropbox-config.json --namespace=dillinger-prod
kubectl create secret generic github-config --from-file=configs/github/github-config.json --namespace=dillinger-prod
kubectl create secret generic onedrive-config --from-file=configs/onedrive/onedrive-config.json --namespace=dillinger-prod
kubectl create secret generic googledrive-config --from-file=configs/googledrive/googledrive-config.json --namespace=dillinger-prod
kubectl create secret generic sponsored-config --from-file=configs/sponsored/sponsored-config.json --namespace=dillinger-prod

```


TODO: Add option for environment variables, not hosted files.

Now update your Kubernetes cluster:
s 
 ```sh
kubectl replace -f dillinger.k8s.dev.yml
```

Once it is "updated" (replaced), delete current pods and the replication controller will automatically restart them with the version containing your secrets/configs.

```sh
kubectl delete pods --all
``` 

Now checkit out with the URL of the app and also see it running in the N|Solid console

```sh
kubectl get svc nsolid-secure-proxy --namespace=nsolid
```
Should output:

```sh
NAME                  CLUSTER-IP    EXTERNAL-IP     PORT(S)          AGE
nsolid-secure-proxy   10.3.244.90   104.198.XX.XX   80/TCP,443/TCP   16h
```