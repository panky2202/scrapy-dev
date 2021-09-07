FROM python:3.8-slim-buster AS environment
RUN apt-get update && apt-get install poppler-utils curl wget gpg -y
RUN DEBIAN_VERSION=10 \
    && wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.asc.gpg \
    && mv microsoft.asc.gpg /etc/apt/trusted.gpg.d/ \
    && wget -q https://packages.microsoft.com/config/debian/$DEBIAN_VERSION/prod.list \
    && mv prod.list /etc/apt/sources.list.d/microsoft-prod.list \
    && chown root:root /etc/apt/trusted.gpg.d/microsoft.asc.gpg \
    && chown root:root /etc/apt/sources.list.d/microsoft-prod.list
RUN apt-get update && apt-get install -y \
    azure-functions-core-tools-3 \
    libzbar0 \
    && rm -rf /var/lib/apt/lists/* \
    && curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
    && bash n 14 \
    && npm install --global yarn \
    && curl -sL https://aka.ms/InstallAzureCLIDeb | bash

RUN export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

FROM mcr.microsoft.com/azure-functions/python:3.0-python3.8 as azure_parsers
# AzureWebJobsScriptRoot could not be changed, it's a limitation of Azure on 2021
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libzbar0 \
    && rm -rf /var/lib/apt/lists/*
COPY . ./scrapy
RUN cd ./scrapy && pip install --cache-dir ./.pip -e .
#COPY ./data_scraping/azure_scraping $AzureWebJobsScriptRoot
COPY data_scraping/azure_scraping $AzureWebJobsScriptRoot
