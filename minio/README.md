# MinIO-compatible object storage

The `minio` service uses the community-maintained Silo fork because the previous MinIO image is no longer available. This image supports amd64 and arm64. The optional workspace client uses the maintained mcli fork and has the same architecture restriction.

## Existing data

Before rebuilding, stop clients and take a consistent backup of your data volume, configuration, credentials and encryption keys. Check the [migration guide](https://silo.pgsty.com/compatibility/migration/), including its legacy filesystem, identity and rollback restrictions. Test the migration on a copy first; starting the new server can change persistent metadata. To roll back, stop the server and restore the pre-upgrade backup and original image. Do not mix MinIO and Silo binaries in a distributed cluster.
