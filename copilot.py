import os
import asyncio
import aiohttp
import json
import websockets
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONAD_CLI_PATH = os.getenv("MONAD_CLI_PATH", "/usr/local/bin/monad-cli")
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")

async def call_claude(prompt: str) -> str:
    """Use Claude to convert user prompt into CLI commands"""
    headers = {"x-api-key": CLAUDE_API_KEY, "Content-Type": "application/json"}
    body = {
        "model": "claude-3-haiku-20240307",
        "messages": [{"role": "user", "content": f"Convert to Monad CLI: {prompt}"}]
    }
    async with aiohttp.ClientSession() as session:
        async with session.post("https://api.anthropic.com/v1/messages", json=body, headers=headers) as resp:
            response = await resp.json()
            return response['content'][0]['text']

async def execute_commands(commands: str, retries=3):
    """Split commands into steps and run asynchronously with retry logic"""
    for cmd in commands.split("→"):
        attempt = 0
        success = False
        
        while attempt < retries and not success:
            proc = await asyncio.create_subprocess_shell(
                f"{MONAD_CLI_PATH} {cmd.strip()}",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()
            
            if proc.returncode == 0:
                print(f"Success: {stdout.decode()}")
                success = True
                
                # Extract transaction hash if available
                tx_hash = extract_tx_hash(stdout.decode())
                if tx_hash:
                    asyncio.create_task(monitor_tx(tx_hash))
            else:
                print(f"Error: {stderr.decode()}")
                # Use Claude to suggest fixes
                fix_prompt = f"Command failed: {cmd}. Error: {stderr.decode()}. Suggest fix."
                fix = await call_claude(fix_prompt)
                print(f"Suggested fix: {fix}")
                cmd = fix  # Update command with AI-suggested fix
                attempt += 1
                
        if not success:
            print(f"Failed to execute command after {retries} attempts: {cmd}")
            return

def extract_tx_hash(output: str) -> str:
    """Extract transaction hash from command output"""
    # This is a simplified example - adjust based on actual output format
    if "Transaction hash:" in output:
        return output.split("Transaction hash:")[1].strip().split()[0]
    return ""

async def monitor_tx(tx_hash: str):
    """Monitor transaction status using WebSocket API"""
    try:
        # Replace with actual Monad WebSocket endpoint
        async with websockets.connect("wss://monad-testnet-ws.com") as ws:
            await ws.send(json.dumps({"method": "subscribe", "params": [tx_hash]}))
            while True:
                response = await ws.recv()
                status = json.loads(response)
                print(f"TX Status: {status}")
                
                # Exit monitoring when transaction is confirmed or failed
                if status.get("status") in ["confirmed", "failed"]:
                    break
    except Exception as e:
        print(f"Error monitoring transaction: {e}")

async def load_workflow_template(template_name: str) -> dict:
    """Load a workflow template from the workflows directory"""
    try:
        with open(f"workflows/{template_name}.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Workflow template '{template_name}' not found")
        return {}

async def main():
    import sys
    
    print("Monad Copilot Pro CLI")
    print("====================\n")
    
    # Check if a prompt was provided as a command-line argument
    if len(sys.argv) > 1:
        # Get prompt from command-line argument
        prompt = sys.argv[1]
        print(f"Processing prompt: {prompt}")
        commands = await call_claude(prompt)
        print(f"Generated commands: {commands}")
        await execute_commands(commands)
    else:
        # Interactive mode
        # Check if user wants to use a template
        use_template = input("Use a workflow template? (y/n): ").lower() == 'y'
        
        if use_template:
            template_name = input("Enter template name (e.g., erc20-token): ")
            template = await load_workflow_template(template_name)
            if template:
                print(f"Loaded template: {template['name']}")
                # Execute template steps
                commands = " → ".join([step['command'] for step in template['steps']])
                await execute_commands(commands)
        else:
            # Get user prompt and convert to commands
            prompt = input("Monad Copilot > ")
            commands = await call_claude(prompt)
            print(f"Generated commands: {commands}")
            await execute_commands(commands)

if __name__ == "__main__":
    asyncio.run(main())