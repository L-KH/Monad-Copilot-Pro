from setuptools import setup, find_packages

setup(
    name="monad-copilot-pro",
    version="1.0.0",
    description="AI-powered smart contract deployment and transaction automation suite for Monad blockchain",
    author="",
    author_email="",
    packages=find_packages(),
    install_requires=[
        "python-dotenv>=1.0.0",
        "requests>=2.31.0",
        "aiohttp>=3.8.5",
        "asyncio>=3.4.3",
        "websockets>=11.0.3"
    ],
    entry_points={
        'console_scripts': [
            'monad-copilot=copilot:main',
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.10",
)