FROM node:8

EXPOSE 7777/udp

RUN apt-get update && apt-get -y install lib32gcc1 unzip wget pcregrep

RUN groupadd -g 999 unturned && \
    useradd -m -r -u 999 -g unturned unturned
ADD scripts /opt/scripts
RUN chown unturned:unturned -R /opt
RUN chmod 777 /opt/scripts/*
USER unturned

CMD [ "/bin/bash", "-c", "/opt/scripts/bootstrap.sh" ]