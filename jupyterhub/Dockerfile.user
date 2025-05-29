FROM tensorflow/tensorflow:latest-gpu

MAINTAINER ahkui <ahkui@outlook.com>

RUN apt-get update && apt-get install -y --no-install-recommends \
        python \
        python-dev \
        && \
    apt-get autoremove -y && \
    apt-get autoclean && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN apt-get update && apt-get install -y --no-install-recommends \
        wget \
        git \
        && \
    apt-get autoremove -y && \
    apt-get autoclean && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN curl -O https://bootstrap.pypa.io/get-pip.py && \
    python3 get-pip.py && \
    rm get-pip.py

RUN python3 -m pip --quiet --no-cache-dir install \
        Pillow \
        h5py \
        ipykernel \
        jupyter \
        notebook \
        jupyterhub \
        matplotlib \
        numpy \
        pandas \
        scipy \
        sklearn \
        Flask \
        gunicorn \
        pymongo \
        redis \
        requests \
        ipyparallel \
        bs4 \
        && \
    python3 -m ipykernel.kernelspec

RUN pip --no-cache-dir install \
    https://storage.googleapis.com/tensorflow/linux/gpu/tensorflow_gpu-1.8.0-cp35-cp35m-linux_x86_64.whl

RUN ln -s -f /usr/bin/python3 /usr/bin/python

COPY start.sh /usr/local/bin/
COPY start-notebook.sh /usr/local/bin/
COPY start-singleuser.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start-notebook.sh
RUN chmod +x /usr/local/bin/start-singleuser.sh

RUN wget --quiet https://github.com/krallin/tini/releases/download/v0.10.0/tini && \
    mv tini /usr/local/bin/tini && \
    chmod +x /usr/local/bin/tini

# cleanup
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENTRYPOINT ["tini", "--"]

CMD ["start-notebook.sh"]


