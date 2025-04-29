// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title MonadPair
 * @dev Liquidity pair contract for the MonadDEX
 */
contract MonadPair is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Tokens in the pair
    address public immutable token0;
    address public immutable token1;
    
    // LP token management
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;
    mapping(address => mapping(address => uint256)) public allowance;
    string public constant name = "Monad LP Token";
    string public constant symbol = "MLPT";
    uint8 public constant decimals = 18;
    
    // Fee configuration
    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public feeNumerator = 3; // 0.3% default fee
    address public feeRecipient;
    
    // Reserves and price accumulators
    uint256 private reserve0;
    uint256 private reserve1;
    uint256 private blockTimestampLast;
    uint256 private price0CumulativeLast;
    uint256 private price1CumulativeLast;
    uint256 private constant MINIMUM_LIQUIDITY = 10**3;
    
    // Events
    event Mint(address indexed sender, uint256 amount0, uint256 amount1, uint256 liquidity);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
    event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to);
    event Sync(uint256 reserve0, uint256 reserve1);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event FeeNumeratorUpdated(uint256 newFeeNumerator);
    event FeeRecipientUpdated(address newFeeRecipient);

    /**
     * @dev Constructor to create a new pair
     * @param _token0 First token address
     * @param _token1 Second token address
     * @param _feeRecipient Address to receive fees
     */
    constructor(address _token0, address _token1, address _feeRecipient) Ownable(msg.sender) {
        require(_token0 != _token1, "MonadPair: IDENTICAL_ADDRESSES");
        require(_token0 != address(0) && _token1 != address(0), "MonadPair: ZERO_ADDRESS");
        
        token0 = _token0;
        token1 = _token1;
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Set the fee numerator (owner only)
     * @param _feeNumerator New fee numerator (e.g., 3 for 0.3%)
     */
    function setFeeNumerator(uint256 _feeNumerator) external onlyOwner {
        require(_feeNumerator <= 50, "MonadPair: FEE_TOO_HIGH"); // Max 5%
        feeNumerator = _feeNumerator;
        emit FeeNumeratorUpdated(_feeNumerator);
    }
    
    /**
     * @dev Set the fee recipient (owner only)
     * @param _feeRecipient New fee recipient address
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "MonadPair: ZERO_ADDRESS");
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }
    
    /**
     * @dev Get current reserves
     * @return _reserve0 Reserve of token0
     * @return _reserve1 Reserve of token1
     * @return _blockTimestampLast Timestamp of last update
     */
    function getReserves() public view returns (uint256 _reserve0, uint256 _reserve1, uint256 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }
    
    /**
     * @dev Update reserves and time accumulator
     * @param balance0 Current balance of token0
     * @param balance1 Current balance of token1
     */
    function _update(uint256 balance0, uint256 balance1) private {
        require(balance0 <= type(uint256).max && balance1 <= type(uint256).max, "MonadPair: OVERFLOW");
        
        uint256 blockTimestamp = block.timestamp;
        uint256 timeElapsed = blockTimestamp - blockTimestampLast;
        
        if (timeElapsed > 0 && reserve0 != 0 && reserve1 != 0) {
            price0CumulativeLast += reserve1 * timeElapsed / reserve0;
            price1CumulativeLast += reserve0 * timeElapsed / reserve1;
        }
        
        reserve0 = balance0;
        reserve1 = balance1;
        blockTimestampLast = blockTimestamp;
        
        emit Sync(reserve0, reserve1);
    }
    
    /**
     * @dev Mint LP tokens - add liquidity
     * @param to Recipient of LP tokens
     * @return liquidity Amount of LP tokens minted
     */
    function mint(address to) external nonReentrant returns (uint256 liquidity) {
        (uint256 _reserve0, uint256 _reserve1,) = getReserves();
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        uint256 amount0 = balance0 - _reserve0;
        uint256 amount1 = balance1 - _reserve1;
        
        if (totalSupply == 0) {
            liquidity = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY); // Permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            liquidity = Math.min(
                (amount0 * totalSupply) / _reserve0,
                (amount1 * totalSupply) / _reserve1
            );
        }
        
        require(liquidity > 0, "MonadPair: INSUFFICIENT_LIQUIDITY_MINTED");
        
        _mint(to, liquidity);
        _update(balance0, balance1);
        
        emit Mint(msg.sender, amount0, amount1, liquidity);
        return liquidity;
    }
    
    /**
     * @dev Burn LP tokens - remove liquidity
     * @param to Recipient of tokens
     * @return amount0 Amount of token0 returned
     * @return amount1 Amount of token1 returned
     */
    function burn(address to) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        uint256 liquidity = balanceOf[address(this)];
        require(liquidity > 0, "MonadPair: INSUFFICIENT_LIQUIDITY_BURNED");
        
        (uint256 _reserve0, uint256 _reserve1,) = getReserves();
        
        amount0 = (liquidity * _reserve0) / totalSupply;
        amount1 = (liquidity * _reserve1) / totalSupply;
        
        require(amount0 > 0 && amount1 > 0, "MonadPair: INSUFFICIENT_LIQUIDITY_BURNED");
        
        _burn(address(this), liquidity);
        
        IERC20(token0).safeTransfer(to, amount0);
        IERC20(token1).safeTransfer(to, amount1);
        
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        
        _update(balance0, balance1);
        
        emit Burn(msg.sender, amount0, amount1, to);
        return (amount0, amount1);
    }
    
    /**
     * @dev Swap tokens
     * @param amount0Out Amount of token0 to receive
     * @param amount1Out Amount of token1 to receive
     * @param to Recipient of tokens
     */
    function swap(uint256 amount0Out, uint256 amount1Out, address to) external nonReentrant {
        require(amount0Out > 0 || amount1Out > 0, "MonadPair: INSUFFICIENT_OUTPUT_AMOUNT");
        
        (uint256 _reserve0, uint256 _reserve1,) = getReserves();
        require(amount0Out < _reserve0 && amount1Out < _reserve1, "MonadPair: INSUFFICIENT_LIQUIDITY");
        
        uint256 balance0 = IERC20(token0).balanceOf(address(this)) - amount0Out;
        uint256 balance1 = IERC20(token1).balanceOf(address(this)) - amount1Out;
        
        uint256 amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint256 amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        
        require(amount0In > 0 || amount1In > 0, "MonadPair: INSUFFICIENT_INPUT_AMOUNT");
        
        // Calculate and apply fees
        if (amount0In > 0) {
            uint256 fee0 = (amount0In * feeNumerator) / FEE_DENOMINATOR;
            amount0In -= fee0;
            IERC20(token0).safeTransfer(feeRecipient, fee0);
            balance0 -= fee0;
        }
        
        if (amount1In > 0) {
            uint256 fee1 = (amount1In * feeNumerator) / FEE_DENOMINATOR;
            amount1In -= fee1;
            IERC20(token1).safeTransfer(feeRecipient, fee1);
            balance1 -= fee1;
        }
        
        // Verify K invariant (adjusted for fees)
        // (reserve0 + amount0In - amount0Out) * (reserve1 + amount1In - amount1Out) >= reserve0 * reserve1
        uint256 balance0Adjusted = balance0 * 1000 - amount0In * feeNumerator;
        uint256 balance1Adjusted = balance1 * 1000 - amount1In * feeNumerator;
        require(
            balance0Adjusted * balance1Adjusted >= uint256(_reserve0) * _reserve1 * (1000**2),
            "MonadPair: K_INVARIANT"
        );
        
        // Transfer tokens to recipient
        if (amount0Out > 0) IERC20(token0).safeTransfer(to, amount0Out);
        if (amount1Out > 0) IERC20(token1).safeTransfer(to, amount1Out);
        
        // Update reserves
        _update(
            IERC20(token0).balanceOf(address(this)),
            IERC20(token1).balanceOf(address(this))
        );
        
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }
    
    // LP Token functions
    
    /**
     * @dev Mint LP tokens
     * @param to Recipient address
     * @param value Amount to mint
     */
    function _mint(address to, uint256 value) private {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }
    
    /**
     * @dev Burn LP tokens
     * @param from Address to burn from
     * @param value Amount to burn
     */
    function _burn(address from, uint256 value) private {
        balanceOf[from] -= value;
        totalSupply -= value;
        emit Transfer(from, address(0), value);
    }
    
    /**
     * @dev Transfer LP tokens
     * @param to Recipient address
     * @param value Amount to transfer
     * @return success Whether transfer succeeded
     */
    function transfer(address to, uint256 value) external returns (bool success) {
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    /**
     * @dev Approve spender to transfer LP tokens
     * @param spender Spender address
     * @param value Amount to approve
     * @return success Whether approval succeeded
     */
    function approve(address spender, uint256 value) external returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    /**
     * @dev Transfer LP tokens from one address to another
     * @param from Sender address
     * @param to Recipient address
     * @param value Amount to transfer
     * @return success Whether transfer succeeded
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool success) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= value;
        }
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
        return true;
    }
}

/**
 * @title MonadFactory
 * @dev Factory for creating MonadPair contracts
 */
contract MonadFactory is Ownable {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    address public feeRecipient;
    
    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 index);
    event FeeRecipientUpdated(address newFeeRecipient);
    
    /**
     * @dev Constructor to set initial fee recipient
     * @param _feeRecipient Address to receive fees
     */
    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Set fee recipient for new pairs
     * @param _feeRecipient New fee recipient address
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "MonadFactory: ZERO_ADDRESS");
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }
    
    /**
     * @dev Get number of pairs
     * @return Number of pairs created
     */
    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }
    
    /**
     * @dev Create a new pair
     * @param tokenA First token address
     * @param tokenB Second token address
     * @return pair Address of the created pair
     */
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "MonadFactory: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "MonadFactory: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "MonadFactory: PAIR_EXISTS");
        
        // Create new pair contract
        MonadPair newPair = new MonadPair(token0, token1, feeRecipient);
        pair = address(newPair);
        
        // Store pair mappings
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        
        emit PairCreated(token0, token1, pair, allPairs.length - 1);
    }
}

/**
 * @title MonadRouter
 * @dev Router for interacting with MonadPair contracts
 */
contract MonadRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    address public immutable factory;
    address public immutable WETH;
    
    /**
     * @dev Constructor to set factory and WETH addresses
     * @param _factory Factory address
     * @param _WETH WETH address
     */
    constructor(address _factory, address _WETH) Ownable(msg.sender) {
        factory = _factory;
        WETH = _WETH;
    }
    
    /**
     * @dev Add liquidity to a pair
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param amountADesired Desired amount of tokenA
     * @param amountBDesired Desired amount of tokenB
     * @param amountAMin Minimum amount of tokenA
     * @param amountBMin Minimum amount of tokenB
     * @param to Recipient address for LP tokens
     * @param deadline Transaction deadline timestamp
     * @return amountA Amount of tokenA used
     * @return amountB Amount of tokenB used
     * @return liquidity Amount of LP tokens received
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external nonReentrant returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        require(deadline >= block.timestamp, "MonadRouter: EXPIRED");
        
        // Create pair if it doesn't exist
        if (MonadFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            MonadFactory(factory).createPair(tokenA, tokenB);
        }
        
        // Calculate optimal amounts
        (amountA, amountB) = _calculateLiquidityAmounts(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
        
        address pair = MonadFactory(factory).getPair(tokenA, tokenB);
        
        // Transfer tokens to pair
        IERC20(tokenA).safeTransferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, pair, amountB);
        
        // Mint LP tokens
        liquidity = MonadPair(pair).mint(to);
        
        return (amountA, amountB, liquidity);
    }
    
    /**
     * @dev Add liquidity ETH to a pair
     * @param token Token address
     * @param amountTokenDesired Desired amount of token
     * @param amountTokenMin Minimum amount of token
     * @param amountETHMin Minimum amount of ETH
     * @param to Recipient address for LP tokens
     * @param deadline Transaction deadline timestamp
     * @return amountToken Amount of token used
     * @return amountETH Amount of ETH used
     * @return liquidity Amount of LP tokens received
     */
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable nonReentrant returns (uint256 amountToken, uint256 amountETH, uint256 liquidity) {
        require(deadline >= block.timestamp, "MonadRouter: EXPIRED");
        
        // Create pair if it doesn't exist
        if (MonadFactory(factory).getPair(token, WETH) == address(0)) {
            MonadFactory(factory).createPair(token, WETH);
        }
        
        // Calculate optimal amounts
        (amountToken, amountETH) = _calculateLiquidityAmounts(
            token,
            WETH,
            amountTokenDesired,
            msg.value,
            amountTokenMin,
            amountETHMin
        );
        
        address pair = MonadFactory(factory).getPair(token, WETH);
        
        // Transfer token to pair
        IERC20(token).safeTransferFrom(msg.sender, pair, amountToken);
        
        // Wrap and transfer ETH to pair
        // For simplicity, we're simulating WETH interaction
        IERC20(WETH).safeTransfer(pair, amountETH);
        
        // Mint LP tokens
        liquidity = MonadPair(pair).mint(to);
        
        // Refund unused ETH
        if (msg.value > amountETH) {
            (bool success, ) = msg.sender.call{value: msg.value - amountETH}("");
            require(success, "MonadRouter: ETH_TRANSFER_FAILED");
        }
        
        return (amountToken, amountETH, liquidity);
    }
    
    /**
     * @dev Remove liquidity from a pair
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param liquidity Amount of LP tokens to burn
     * @param amountAMin Minimum amount of tokenA to receive
     * @param amountBMin Minimum amount of tokenB to receive
     * @param to Recipient address for tokens
     * @param deadline Transaction deadline timestamp
     * @return amountA Amount of tokenA received
     * @return amountB Amount of tokenB received
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        require(deadline >= block.timestamp, "MonadRouter: EXPIRED");
        
        address pair = MonadFactory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "MonadRouter: PAIR_NOT_FOUND");
        
        // Transfer LP tokens to pair
        MonadPair(pair).transferFrom(msg.sender, pair, liquidity);
        
        // Burn LP tokens
        (amountA, amountB) = MonadPair(pair).burn(to);
        
        require(amountA >= amountAMin, "MonadRouter: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "MonadRouter: INSUFFICIENT_B_AMOUNT");
        
        return (amountA, amountB);
    }
    
    /**
     * @dev Swap exact tokens for tokens
     * @param amountIn Exact amount to swap
     * @param amountOutMin Minimum amount to receive
     * @param path Path of token addresses
     * @param to Recipient address
     * @param deadline Transaction deadline timestamp
     * @return amounts Amounts of tokens swapped at each step
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external nonReentrant returns (uint256[] memory amounts) {
        require(deadline >= block.timestamp, "MonadRouter: EXPIRED");
        require(path.length >= 2, "MonadRouter: INVALID_PATH");
        
        amounts = _getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "MonadRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        
        // Transfer tokens to first pair
        address firstPair = MonadFactory(factory).getPair(path[0], path[1]);
        require(firstPair != address(0), "MonadRouter: PAIR_NOT_FOUND");
        
        IERC20(path[0]).safeTransferFrom(msg.sender, firstPair, amounts[0]);
        
        // Execute swaps through path
        _swap(amounts, path, to);
        
        return amounts;
    }
    
    /**
     * @dev Calculate optimal amounts for liquidity provision
     */
    function _calculateLiquidityAmounts(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal view returns (uint256 amountA, uint256 amountB) {
        address pair = MonadFactory(factory).getPair(tokenA, tokenB);
        
        if (pair == address(0) || MonadPair(pair).totalSupply() == 0) {
            // No existing liquidity, use provided amounts
            amountA = amountADesired;
            amountB = amountBDesired;
        } else {
            // Get existing reserves to calculate optimal amounts
            (uint256 reserveA, uint256 reserveB, ) = MonadPair(pair).getReserves();
            
            if (tokenA > tokenB) {
                (reserveA, reserveB) = (reserveB, reserveA);
            }
            
            uint256 amountBOptimal = (amountADesired * reserveB) / reserveA;
            
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "MonadRouter: INSUFFICIENT_B_AMOUNT");
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint256 amountAOptimal = (amountBDesired * reserveA) / reserveB;
                require(amountAOptimal <= amountADesired, "MonadRouter: EXCESSIVE_A_AMOUNT");
                require(amountAOptimal >= amountAMin, "MonadRouter: INSUFFICIENT_A_AMOUNT");
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
        }
        
        return (amountA, amountB);
    }
    
    /**
     * @dev Calculate amounts out for a swap
     */
    function _getAmountsOut(uint256 amountIn, address[] calldata path) internal view returns (uint256[] memory amounts) {
        require(path.length >= 2, "MonadRouter: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        for (uint256 i = 0; i < path.length - 1; i++) {
            address pair = MonadFactory(factory).getPair(path[i], path[i + 1]);
            require(pair != address(0), "MonadRouter: PAIR_NOT_FOUND");
            
            (uint256 reserveIn, uint256 reserveOut, ) = MonadPair(pair).getReserves();
            
            if (path[i] > path[i + 1]) {
                (reserveIn, reserveOut) = (reserveOut, reserveIn);
            }
            
            // Calculate amount out with fee
            uint256 amountInWithFee = amounts[i] * (1000 - MonadPair(pair).feeNumerator());
            amounts[i + 1] = (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee);
        }
        
        return amounts;
    }
    
    /**
     * @dev Execute swap through path
     */
    function _swap(uint256[] memory amounts, address[] calldata path, address to) internal {
        for (uint256 i = 0; i < path.length - 1; i++) {
            address input = path[i];
            address output = path[i + 1];
            address pair = MonadFactory(factory).getPair(input, output);
            
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input < output ? 
                (uint256(0), amountOut) : (amountOut, uint256(0));
            
            address nextPair = i < path.length - 2 ? 
                MonadFactory(factory).getPair(output, path[i + 2]) : address(0);
            
            address swapTo = i < path.length - 2 ? nextPair : to;
            
            MonadPair(pair).swap(amount0Out, amount1Out, swapTo);
        }
    }
    
    // Receive ETH for addLiquidityETH
    receive() external payable {
        require(msg.sender == WETH, "MonadRouter: INVALID_SENDER");
    }
}