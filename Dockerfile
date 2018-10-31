FROM ubuntu:18.04

EXPOSE 7777/udp


RUN dpkg --add-architecture i386
RUN apt-get update && apt-get -y install lib32gcc1 unzip wget

RUN groupadd -g 999 unturned && \
    useradd -r -u 999 -g unturned unturned
ADD scripts /opt/scripts
RUN chown unturned:unturned -R /opt
USER unturned

CMD [ "/bin/bash", "-c", "/opt/scripts/bootstrap.sh" ]