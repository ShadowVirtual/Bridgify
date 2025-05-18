#!/bin/bash

# Copyright © 2024 Ewsgit <https://ewsgit.uk> & Zakleby <https://github.com/zakleby>

sudo journalctl --vacuum-time=1s --unit=bridgify.service
sudo journalctl -ef -u bridgify.service -o cat
