 #!/bin/bash 

kubectl create secret generic dropbox-config --from-file=configs/dropbox/dropbox-config.json --namespace=dillinger-dev
kubectl create secret generic github-config --from-file=configs/github/github-config.json --namespace=dillinger-dev
kubectl create secret generic onedrive-config --from-file=configs/onedrive/onedrive-config.json --namespace=dillinger-dev
kubectl create secret generic googledrive-config --from-file=configs/googledrive/googledrive-config.json --namespace=dillinger-dev
kubectl create secret generic dropbox-config --from-file=configs/dropbox/dropbox-config.json --namespace=dillinger-prod
kubectl create secret generic github-config --from-file=configs/github/github-config.json --namespace=dillinger-prod
kubectl create secret generic onedrive-config --from-file=configs/onedrive/onedrive-config.json --namespace=dillinger-prod
kubectl create secret generic googledrive-config --from-file=configs/googledrive/googledrive-config.json --namespace=dillinger-prod
