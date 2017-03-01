 #!/bin/bash 

kubectl create secret generic dropbox-config --from-file=configs/dropbox/dropbox-config.json --namespace=dillinger-dev
kubectl create secret generic github-config --from-file=configs/github/github-config.json --namespace=dillinger-dev
kubectl create secret generic onedrive-config --from-file=configs/onedrive/onedrive-config.json --namespace=dillinger-dev
kubectl create secret generic googledrive-config --from-file=configs/googledrive/googledrive-config.json --namespace=dillinger-dev
kubectl create secret generic sponsored-config --from-file=configs/sponsored/sponsored-config.json --namespace=dillinger-dev
kubectl create secret generic googleanalytics-config --from-file=configs/googleanalytics/googleanalytics-config.json --namespace=dillinger-dev
kubectl create secret generic medium-config --from-file=configs/medium/medium-config.json --namespace=dillinger-dev
kubectl create secret generic bitbucket-config --from-file=configs/bitbucket/bitbucket-config.json --namespace=dillinger-dev
kubectl create secret generic dropbox-config --from-file=configs/dropbox/dropbox-config.json --namespace=dillinger-prod
kubectl create secret generic github-config --from-file=configs/github/github-config.json --namespace=dillinger-prod
kubectl create secret generic onedrive-config --from-file=configs/onedrive/onedrive-config.json --namespace=dillinger-prod
kubectl create secret generic googledrive-config --from-file=configs/googledrive/googledrive-config.json --namespace=dillinger-prod
kubectl create secret generic sponsored-config --from-file=configs/sponsored/sponsored-config.json --namespace=dillinger-prod
kubectl create secret generic googleanalytics-config --from-file=configs/googleanalytics/googleanalytics-config.json --namespace=dillinger-prod
kubectl create secret generic medium-config --from-file=configs/medium/medium-config.json --namespace=dillinger-prod
kubectl create secret generic bitbucket-config --from-file=configs/bitbucket/bitbucket-config.json --namespace=dillinger-prod