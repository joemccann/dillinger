# Dillinger + Kubernetes

Some tips on how to deploy Dillinger with Kubernetes....

NOTE: This document assumes you've successfully created a cluster on GCP and you have a GCP account with a project associated with the cluster.

# Setup

Create the replication controller and the service running Dillinger.

```sh
kubectl create -f web-controller.yml && kubectl create -f web-service.yml
```

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

Update the version numbers in `package.json` (we should fix this so it isn't manual but npm environment variables don't work) for the `build-gcp` script.  There are *three* locations where you need to update the versions in the `package.json`.

```sh
npm run build-gcp
```

This will tag the docker image and push to the Google Container Registry.

Now, you need to update the controller file, `web-controller.yml` to the latest image you just pushed to Google Container Registry (e.g. gcr.io/dillinger-cluster/dillinger:v3.3.2).  Save and close.

```sh
vim web-controller.yml
```

Then update your Kubernetes cluster with the newest version

```sh
kubectl replace -f web-controller.yml
```

## Create Secrets to Expose Plugin Configs

We now want to be able to expose our plugins like Dropbox and Github.  Instead of using environment variables we'll use the `dropbox-config.json` (and others) file which contains sensitive information.  That's why we use [Kubernetes Secrets](http://kubernetes.io/docs/user-guide/secrets/#creating-your-own-secrets) to protect it.

In the root of the Dillinger project directory, run:

```sh
kubectl create secret generic dropbox-config --from-file=./plugins/dropbox/dropbox-config.json
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

 Now updte your Kubernetes cluster
 
 ```sh
kubectl replace -f web-controller.yml
```

Once it is "updated" (replaced), delete current pods and the replication controller will automatically restart them with the version containing your secrets/configs.

```sh
kubectl delete pods --all
``` 