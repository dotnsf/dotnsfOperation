# dotnsfOperation

## Overview

Custom service broker sample for IBM Bluemix(Cloud Foundry) in Node.js

## Install

- Download or Git clone this codes.

- Edit following files

    - manifest.yml

        - replace name, host, and domain with your application name, host, and domain.

    - app.js 

        - replace service_host variable with your applicatoin hostname.

        - replace my_service with your service broker name, description, plans, dashboard_client, and metadata.

        - (optional)replace auth_user and auth_pass with your authentication information.

        - (optional)replace result.credentials( in function '/v2/service_instances/:service_id/service_bindings/:binding_id' ) with your credential information.

        - (optional)replace html( in function '/operation/dashboard/:instance_id' ) with your favorite content.

- Push application into Bluemix Node.js runtime.

## License

This code is licensed under MIT.

## Copyright

2017 dotnsf@gmail.com all rights reserved.


