# demo.py
import asyncio
from copilot import execute_commands

async def demo():
    print("Monad Copilot Pro - Demo")
    print("========================\n")
    print("Executing a sample NFT deployment workflow...\n")
    
    # Sample commands for NFT deployment
    commands = "compile nft.sol → deploy --network testnet → mint --amount 5 --to 0x123"
    print(f"Commands to execute: {commands}\n")
    
    await execute_commands(commands)
    print("\nDemo completed!")

if __name__ == "__main__":
    asyncio.run(demo())