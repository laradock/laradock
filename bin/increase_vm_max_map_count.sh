#!/usr/bin/env sh

# dev mode gives
# elasticsearch_1        | [1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
sudo sysctl -w vm.max_map_count=262144
sudo sysctl -p