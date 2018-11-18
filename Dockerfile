FROM node:8

EXPOSE 7777/udp 2080/tcp 2443/tcp

RUN apt-get update && apt-get -y install lib32gcc1 unzip wget pcregrep

RUN groupadd -g 999 unturned && \
    useradd -m -r -u 999 -g unturned unturned
ADD scripts /opt/scripts
ADD panel /opt/panel
RUN chown unturned:unturned -R /opt
RUN chmod 777 /opt/scripts/*
USER unturned

CMD [ "/bin/bash", "-c", "/opt/scripts/bootstrap.sh" ]