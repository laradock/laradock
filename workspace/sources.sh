#!/bin/bash

set -xe;

if type "tee" 2>/dev/null && [ -n "${UBUNTU_SOURCE}" ]; then
    SOURCE_PATH="/etc/apt/sources.list"
    cp ${SOURCE_PATH} ${SOURCE_PATH}.bak && rm -rf ${SOURCE_PATH}
    case "${UBUNTU_SOURCE}" in
        "aliyun")
            tee ${SOURCE_PATH} <<-'EOF'
deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
EOF
;;
        "zju")
            tee ${SOURCE_PATH} <<-'EOF'
deb http://mirrors.zju.edu.cn/ubuntu bionic main universe restricted multiverse
deb http://mirrors.zju.edu.cn/ubuntu bionic-security main universe restricted multiverse
deb http://mirrors.zju.edu.cn/ubuntu bionic-updates main universe restricted multiverse
deb http://mirrors.zju.edu.cn/ubuntu bionic-backports main universe restricted multiverse
deb-src http://mirrors.zju.edu.cn/ubuntu bionic main universe restricted multiverse
deb-src http://mirrors.zju.edu.cn/ubuntu bionic-security main universe restricted multiverse
deb-src http://mirrors.zju.edu.cn/ubuntu bionic-updates main universe restricted multiverse
deb-src http://mirrors.zju.edu.cn/ubuntu bionic-backports main universe restricted multiverse
EOF
;;
        "tsinghua")
            tee ${SOURCE_PATH} <<-'EOF'
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic main universe restricted multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-security main universe restricted multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-updates main universe restricted multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-backports main universe restricted multiverse
deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic main universe restricted multiverse
deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-security main universe restricted multiverse
deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-updates main universe restricted multiverse
deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-backports main universe restricted multiverse
EOF
;;
        "163")
            tee ${SOURCE_PATH} <<-'EOF'
deb http://mirrors.163.com/ubuntu/ bionic main universe restricted multiverse
deb http://mirrors.163.com/ubuntu/ bionic-security main universe restricted multiverse
deb http://mirrors.163.com/ubuntu/ bionic-updates main universe restricted multiverse
deb http://mirrors.163.com/ubuntu/ bionic-backports main universe restricted multiverse
deb-src http://mirrors.163.com/ubuntu/ bionic main universe restricted multiverse
deb-src http://mirrors.163.com/ubuntu/ bionic-security main universe restricted multiverse
deb-src http://mirrors.163.com/ubuntu/ bionic-updates main universe restricted multiverse
deb-src http://mirrors.163.com/ubuntu/ bionic-backports main universe restricted multiverse
EOF
;;
        "ustc")
            tee ${SOURCE_PATH} <<-'EOF'
deb https://mirrors.ustc.edu.cn/ubuntu/ bionic main universe restricted multiverse
deb https://mirrors.ustc.edu.cn/ubuntu/ bionic-security main universe restricted multiverse
deb https://mirrors.ustc.edu.cn/ubuntu/ bionic-updates main universe restricted multiverse
deb https://mirrors.ustc.edu.cn/ubuntu/ bionic-backports main universe restricted multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu/ bionic main universe restricted multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu/ bionic-security main universe restricted multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu/ bionic-updates main universe restricted multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu/ bionic-backports main universe restricted multiverse
EOF
;;
        *)
            echo "Please check whether there is aliyun|zju|tsinghua|163|ustc in the parameter"
            exit 1;;
    esac
fi
