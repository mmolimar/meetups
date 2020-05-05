#!/bin/bash

HDFS_HOST=${HDFS_HOST:-localhost}
HDFS_PORT=${HDFS_PORT:-8020}

max_records=100
index=0
tmp_dir=$(mktemp -d)
while :
do
  filename="sample_records_$index.csv"
  filepath="$tmp_dir/$filename"
  echo "time,latitude,longitude,depth,mag,magType,nst,gap,dmin,rms,net,id,updated,place,type,horizontalError,depthError,magError,magNst,status,locationSource,magSource" > $filepath
  for i in $(seq 1 $max_records)
  do
    id=$(openssl rand -hex 12)
    time=$(date +%Y-%m-%dT%H:%M:%S.000Z)
    updated=$(date +%Y-%m-%dT%H:%M:%S.000Z)
    latitude=$(jot -p 4 -r 1 -90 90)
    longitude=$(jot -p 4 -r 1 -180 180)
    depth=$(jot -p 1 -r 1 0 100)
    mag=$(jot -p 1 -r 1 0 10)
    echo "$time,$latitude,$longitude,$depth,$mag,ml,,,,0.78,ak,$id,$updated,"Sample record - Kafka Connect Meetup",earthquake,,0.5,,,automatic,sr,sr" >> $filepath
  done
  echo "Moving file '$filename' to HDFS..."
  $HADOOP_HOME/bin/hdfs dfs -moveFromLocal $filepath hdfs://$HDFS_HOST:$HDFS_PORT/data &> /dev/null
  index=$((index+1))
done
