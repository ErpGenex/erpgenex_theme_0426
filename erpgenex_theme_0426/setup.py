#!/usr/bin/env python
from setuptools import setup, find_packages

setup(
    name="erpgenex_theme_0426",
    version="1.0.0",
    description="erpgenex_theme_0426 application",
    author="ErpGenEx",
    author_email="info@omnexa.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=[
        "frappe>=15.0.0"
    ]
)
