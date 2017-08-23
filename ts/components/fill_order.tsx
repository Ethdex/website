import * as _ from 'lodash';
import * as React from 'react';
import {Link} from 'react-router-dom';
import {ZeroEx} from '0x.js';
import * as moment from 'moment';
import * as BigNumber from 'bignumber.js';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import {utils} from 'ts/utils/utils';
import {constants} from 'ts/utils/constants';
import {zeroEx} from 'ts/utils/zero_ex';
import {
    Side,
    TokenByAddress,
    Order,
    BlockchainErrs,
    OrderToken,
    Token,
    ExchangeContractErrs,
    AlertTypes,
    ContractResponse,
} from 'ts/types';
import {Alert} from 'ts/components/ui/alert';
import {TokenAmountInput} from 'ts/components/inputs/token_amount_input';
import {VisualOrder} from 'ts/components/visual_order';
import {LifeCycleRaisedButton} from 'ts/components/ui/lifecycle_raised_button';
import {SchemaValidator} from 'ts/schemas/validator';
import {orderSchema} from 'ts/schemas/order_schema';
import {Dispatcher} from 'ts/redux/dispatcher';
import {Blockchain} from 'ts/blockchain';
import {errorReporter} from 'ts/utils/error_reporter';
import {customTokenStorage} from 'ts/local_storage/custom_token_storage';

interface FillOrderProps {
    blockchain: Blockchain;
    blockchainErr: BlockchainErrs;
    orderFillAmount: BigNumber.BigNumber;
    networkId: number;
    userAddress: string;
    tokenByAddress: TokenByAddress;
    initialOrder: Order;
    dispatcher: Dispatcher;
}

interface FillOrderState {
    isValidOrder: boolean;
    globalErrMsg: string;
    orderJSON: string;
    orderJSONErrMsg: string;
    parsedOrder: Order;
    didFillOrderSucceed: boolean;
    amountAlreadyFilled: BigNumber.BigNumber;
}

export class FillOrder extends React.Component<FillOrderProps, FillOrderState> {
    private validator: SchemaValidator;
    constructor(props: FillOrderProps) {
        super(props);
        this.state = {
            globalErrMsg: '',
            isValidOrder: false,
            didFillOrderSucceed: false,
            orderJSON: _.isUndefined(this.props.initialOrder) ? '' : JSON.stringify(this.props.initialOrder),
            orderJSONErrMsg: '',
            parsedOrder: this.props.initialOrder,
            amountAlreadyFilled: new BigNumber(0),
        };
        this.validator = new SchemaValidator();
    }
    public componentWillMount() {
        if (!_.isEmpty(this.state.orderJSON)) {
            this.validateFillOrderFireAndForgetAsync(this.state.orderJSON);
        }
    }
    public componentDidMount() {
        window.scrollTo(0, 0);
    }
    public render() {
        const addresses = _.keys(this.props.tokenByAddress);
        const hintSideToAssetToken = {
            [Side.deposit]: {
                amount: new BigNumber(35),
                address: addresses[0],
            },
            [Side.receive]: {
                amount: new BigNumber(89),
                address: addresses[1],
            },
        };
        const hintOrderExpiryTimestamp = utils.initialOrderExpiryUnixTimestampSec();
        const hintSignatureData = {
            hash: '0xf965a9978a0381ab58f5a2408ad967c...',
            r: '0xf01103f759e2289a28593eaf22e5820032...',
            s: '937862111edcba395f8a9e0cc1b2c5e12320...',
            v: 27,
        };
        const hintSalt = ZeroEx.generatePseudoRandomSalt();
        const exchangeContract = this.props.blockchain.getExchangeContractAddressIfExists();
        const hintOrder = utils.generateOrder(this.props.networkId, exchangeContract, hintSideToAssetToken,
                                              hintOrderExpiryTimestamp, '', '', constants.MAKER_FEE,
                                              constants.TAKER_FEE, constants.FEE_RECIPIENT_ADDRESS,
                                              hintSignatureData, this.props.tokenByAddress, hintSalt);
        const hintOrderJSON = `${JSON.stringify(hintOrder, null, '\t').substring(0, 500)}...`;
        return (
            <div className="clearfix lg-px4 md-px4 sm-px2" style={{minHeight: 600}}>
                <h3>Fill an order</h3>
                <Divider />
                <div className="pt2 pb2">
                    Paste an order JSON snippet below to begin
                </div>
                <div className="pb2">Order JSON</div>
                <Paper className="p1 overflow-hidden" style={{height: 164}}>
                    <TextField
                        id="orderJSON"
                        hintStyle={{bottom: 0, top: 0}}
                        fullWidth={true}
                        value={this.state.orderJSON}
                        onChange={this.onFillOrderChanged.bind(this)}
                        hintText={hintOrderJSON}
                        multiLine={true}
                        rows={6}
                        rowsMax={6}
                        underlineStyle={{display: 'none'}}
                        textareaStyle={{marginTop: 0}}
                    />
                </Paper>
                <div>
                    {this.state.orderJSONErrMsg !== '' &&
                        <Alert type={AlertTypes.ERROR} message={this.state.orderJSONErrMsg} />
                    }
                    {!_.isUndefined(this.state.parsedOrder) && this.renderVisualOrder()}
                </div>
            </div>
        );
    }
    private renderVisualOrder() {
        const takerTokenAddress = this.state.parsedOrder.taker.token.address;
        const takerToken = this.props.tokenByAddress[takerTokenAddress];
        const orderTakerAmount = new BigNumber(this.state.parsedOrder.taker.amount);
        const orderMakerAmount = new BigNumber(this.state.parsedOrder.maker.amount);
        const takerAssetToken = {
            amount: orderTakerAmount.minus(this.state.amountAlreadyFilled),
            symbol: takerToken.symbol,
        };
        const fillToken = this.props.tokenByAddress[takerToken.address];
        const makerTokenAddress = this.state.parsedOrder.maker.token.address;
        const makerToken = this.props.tokenByAddress[makerTokenAddress];
        const makerAssetToken = {
            amount: orderMakerAmount.times(takerAssetToken.amount).div(orderTakerAmount),
            symbol: makerToken.symbol,
        };
        const fillAssetToken = {
            amount: this.props.orderFillAmount,
            symbol: takerToken.symbol,
        };
        const orderTaker = this.state.parsedOrder.taker.address !== '' ? this.state.parsedOrder.taker.address :
                           this.props.userAddress;
        const parsedOrderExpiration = new BigNumber(this.state.parsedOrder.expiration);
        const expiryDate = utils.convertToReadableDateTimeFromUnixTimestamp(parsedOrderExpiration);
        return (
            <div className="pt3 pb1">
                <span>Order details</span>
                <div className="lg-px4 md-px4 sm-px0">
                    <div className="lg-px4 md-px4 sm-px1 pt1">
                        <VisualOrder
                            orderTakerAddress={orderTaker}
                            orderMakerAddress={this.state.parsedOrder.maker.address}
                            makerAssetToken={makerAssetToken}
                            takerAssetToken={takerAssetToken}
                            makerToken={makerToken}
                            takerToken={takerToken}
                        />
                        <div className="center pt3 pb2">
                            Expires: {expiryDate} UTC
                        </div>
                    </div>
                </div>
                <div className="mx-auto" style={{width: 238, height: 108}}>
                    <TokenAmountInput
                        label="Fill amount"
                        onChange={this.onFillAmountChange.bind(this)}
                        shouldShowIncompleteErrs={false}
                        token={fillToken}
                        amount={fillAssetToken.amount}
                        shouldCheckBalance={true}
                        shouldCheckAllowance={true}
                    />
                </div>
                <div>
                    <LifeCycleRaisedButton
                        labelReady="Fill order"
                        labelLoading="Filling order..."
                        labelComplete="Order filled!"
                        onClickAsyncFn={this.onFillOrderClickAsync.bind(this)}
                    />
                    {this.state.globalErrMsg !== '' &&
                        <Alert type={AlertTypes.ERROR} message={this.state.globalErrMsg} />
                    }
                    {this.state.didFillOrderSucceed &&
                        <Alert
                            type={AlertTypes.SUCCESS}
                            message={this.renderSuccessMsg()}
                        />
                    }
                </div>
            </div>
        );
    }
    private renderSuccessMsg() {
        return (
            <div>
                Order successfully filled. See the trade details in your{' '}
                <Link
                    to="/otc/trades"
                    style={{color: 'white'}}
                >
                    trade history
                </Link>
            </div>
        );
    }
    private onFillAmountChange(isValid: boolean, amount?: BigNumber.BigNumber) {
        this.props.dispatcher.updateOrderFillAmount(amount);
    }
    private onFillOrderChanged(e: any) {
        this.setState({
            didFillOrderSucceed: false,
        });
        const orderJSON = e.target.value;
        this.validateFillOrderFireAndForgetAsync(orderJSON);
    }
    private async validateFillOrderFireAndForgetAsync(orderJSON: string) {
        let orderJSONErrMsg = '';
        let parsedOrder: Order;
        try {
            const order = JSON.parse(orderJSON);
            const validationResult = this.validator.validate(order, orderSchema);
            if (validationResult.errors.length > 0) {
                orderJSONErrMsg = 'Submitted order JSON is not a valid order';
                utils.consoleLog(`Unexpected order JSON validation error: ${validationResult.errors.join(', ')}`);
                return;
            }
            parsedOrder = order;

            const exchangeContractAddr = this.props.blockchain.getExchangeContractAddressIfExists();
            const makerAmount = new BigNumber(parsedOrder.maker.amount);
            const takerAmount = new BigNumber(parsedOrder.taker.amount);
            const expiration = new BigNumber(parsedOrder.expiration);
            const salt = new BigNumber(parsedOrder.salt);
            const parsedMakerFee = new BigNumber(parsedOrder.maker.feeAmount);
            const parsedTakerFee = new BigNumber(parsedOrder.taker.feeAmount);
            const orderHash = zeroEx.getOrderHash(parsedOrder.exchangeContract, parsedOrder.maker.address,
                            parsedOrder.taker.address, parsedOrder.maker.token.address,
                            parsedOrder.taker.token.address, parsedOrder.feeRecipient,
                            makerAmount, takerAmount, parsedMakerFee, parsedTakerFee,
                            expiration, salt);

            const signature = parsedOrder.signature;
            const isValidSignature = ZeroEx.isValidSignature(signature.hash, signature, parsedOrder.maker.address);
            if (this.props.networkId !== parsedOrder.networkId) {
                orderJSONErrMsg = `This order was made on another Ethereum network
                                   (id: ${parsedOrder.networkId}). Connect to this network to fill.`;
                parsedOrder = undefined;
            } else if (exchangeContractAddr !== parsedOrder.exchangeContract) {
                orderJSONErrMsg = 'This order was made using a deprecated 0x Exchange contract.';
                parsedOrder = undefined;
            } else if (orderHash !== signature.hash) {
                orderJSONErrMsg = 'Order hash does not match supplied plaintext values';
                parsedOrder = undefined;
            } else if (!isValidSignature) {
                orderJSONErrMsg = 'Order signature is invalid';
                parsedOrder = undefined;
            } else {
                // Update user supplied order cache so that if they navigate away from fill view
                // e.g to set a token allowance, when they come back, the fill order persists
                this.props.dispatcher.updateUserSuppliedOrderCache(parsedOrder);
                this.addTokenToCustomTokensIfUnseen(parsedOrder.maker.token);
                this.addTokenToCustomTokensIfUnseen(parsedOrder.taker.token);
            }
        } catch (err) {
            if (orderJSON !== '') {
                orderJSONErrMsg = 'Submitted order JSON is not valid JSON';
            }
            this.setState({
                orderJSON,
                orderJSONErrMsg,
                parsedOrder,
            });
            return;
        }

        let amountAlreadyFilled = new BigNumber(0);
        if (orderJSONErrMsg !== '') {
            // Clear cache entry if user updates orderJSON to invalid entry
            this.props.dispatcher.updateUserSuppliedOrderCache(undefined);
        } else {
            const orderHash = parsedOrder.signature.hash;
            amountAlreadyFilled = await this.props.blockchain.getFillAmountAsync(orderHash);
        }

        const makerTokenSymbol = this.removeSymbolFlourishIfExists(parsedOrder.maker.token.symbol);
        const isMakerTokenSymbolInTokenRegistry = await this.props.blockchain.isSymbolInTokenRegistryAsync(
            makerTokenSymbol,
        );
        const isMakerTokenAddressInRegistry = await this.props.blockchain.isAddressInTokenRegistryAsync(
            parsedOrder.maker.token.address,
        );
        const takerTokenSymbol = this.removeSymbolFlourishIfExists(parsedOrder.taker.token.symbol);
        const isTakerTokenSymbolInTokenRegistry = await this.props.blockchain.isSymbolInTokenRegistryAsync(
            takerTokenSymbol,
        );
        const isTakerTokenAddressInRegistry = await this.props.blockchain.isAddressInTokenRegistryAsync(
            parsedOrder.taker.token.address,
        );
        if (isMakerTokenSymbolInTokenRegistry && !isMakerTokenAddressInRegistry || isTakerTokenSymbolInTokenRegistry &&
            !isTakerTokenAddressInRegistry) {
            orderJSONErrMsg = 'This order is invalid. Contact the 0x team if you think this is an accident.';
            parsedOrder = undefined;
        }

        this.setState({
            orderJSON,
            orderJSONErrMsg,
            parsedOrder,
            amountAlreadyFilled,
        });
    }

    private async onFillOrderClickAsync(): Promise<boolean> {
        if (this.props.blockchainErr !== '' || this.props.userAddress === '') {
            this.props.dispatcher.updateShouldBlockchainErrDialogBeOpen(true);
            return false;
        }

        this.setState({
            didFillOrderSucceed: false,
        });

        const parsedOrder = this.state.parsedOrder;
        const makerTokenAddress = parsedOrder.maker.token.address;
        const takerTokenAddress = parsedOrder.taker.token.address;
        const depositAssetToken = {
            address: makerTokenAddress,
            amount: new BigNumber(parsedOrder.maker.amount),
        };
        const receiveAssetToken = {
            address: takerTokenAddress,
            amount: new BigNumber(parsedOrder.taker.amount),
        };
        const parsedOrderExpiration = new BigNumber(this.state.parsedOrder.expiration);
        const orderHash = parsedOrder.signature.hash;
        const amountAlreadyFilled = await this.props.blockchain.getFillAmountAsync(orderHash);
        const amountLeftToFill = receiveAssetToken.amount.minus(amountAlreadyFilled);
        const specifiedTakerAddressIfExists = parsedOrder.taker.address.toLowerCase();
        const takerFillAmount = this.props.orderFillAmount;
        const makerFillAmount = takerFillAmount.times(depositAssetToken.amount).div(receiveAssetToken.amount);
        const takerAddress = this.props.userAddress;
        const takerToken = this.props.tokenByAddress[takerTokenAddress];
        let isValidSignature = false;
        if (this.props.userAddress === '') {
            const signatureData = parsedOrder.signature;
            isValidSignature = ZeroEx.isValidSignature(signatureData.hash, signatureData, parsedOrder.maker.address);
        } else {
            isValidSignature = await this.props.blockchain.isValidSignatureAsync(parsedOrder.maker.address,
                                                              parsedOrder.signature);
        }

        if (_.isUndefined(takerAddress)) {
            this.props.dispatcher.updateShouldBlockchainErrDialogBeOpen(true);
            return false;
        }

        const [
          makerBalance,
          makerAllowance,
        ] = await this.props.blockchain.getTokenBalanceAndAllowanceAsync(parsedOrder.maker.address,
                                                                         parsedOrder.maker.token.address);
        const currentUnixTimestamp = moment().unix();
        let globalErrMsg = '';
        if (_.isUndefined(takerFillAmount)) {
            globalErrMsg = 'You must specify a fill amount';
        } else if (takerFillAmount.lte(0) || takerFillAmount.gt(takerToken.balance) ||
            takerFillAmount.gt(takerToken.allowance)) {
            globalErrMsg = 'You must fix the above errors in order to fill this order';
        } else if (specifiedTakerAddressIfExists !== '' && specifiedTakerAddressIfExists !== takerAddress) {
            globalErrMsg = `This order can only be filled by ${specifiedTakerAddressIfExists}`;
        } else if (parsedOrderExpiration.lt(currentUnixTimestamp)) {
            globalErrMsg = `This order has expired`;
        } else if (amountLeftToFill.eq(0)) {
            globalErrMsg = 'This order has already been completely filled';
        } else if (takerFillAmount.gt(amountLeftToFill)) {
            const amountLeftToFillInUnits = ZeroEx.toUnitAmount(amountLeftToFill, parsedOrder.taker.token.decimals);
            globalErrMsg = `Cannot fill more then remaining ${amountLeftToFillInUnits} ${takerToken.symbol}`;
        } else if (makerBalance.lt(makerFillAmount)) {
            globalErrMsg = 'Maker no longer has a sufficient balance to complete this order';
        } else if (makerAllowance.lt(makerFillAmount)) {
            globalErrMsg = 'Maker does not have a high enough allowance set to complete this order';
        } else if (!isValidSignature) {
            globalErrMsg = 'Order signature is not valid';
        }
        if (globalErrMsg !== '') {
            this.setState({
                globalErrMsg,
            });
            return false;
        }

        const parsedOrderSalt = new BigNumber(parsedOrder.salt);
        const parsedMakerFee = new BigNumber(parsedOrder.maker.feeAmount);
        const parsedTakerFee = new BigNumber(parsedOrder.taker.feeAmount);
        try {
            const response: ContractResponse = await this.props.blockchain.fillOrderAsync(parsedOrder.maker.address,
                                                       parsedOrder.taker.address,
                                                       this.props.tokenByAddress[makerTokenAddress].address,
                                                       this.props.tokenByAddress[takerTokenAddress].address,
                                                       depositAssetToken.amount,
                                                       receiveAssetToken.amount,
                                                       parsedMakerFee,
                                                       parsedTakerFee,
                                                       parsedOrderExpiration,
                                                       parsedOrder.feeRecipient,
                                                       this.props.orderFillAmount,
                                                       parsedOrder.signature,
                                                       parsedOrderSalt,
                                                   );
            // After fill completes, let's update the token balances
            const makerToken = this.props.tokenByAddress[makerTokenAddress];
            const tokens = [makerToken, takerToken];
            await this.props.blockchain.updateTokenBalancesAndAllowancesAsync(tokens);
            const orderFilledAmount = response.logs[0].args.filledTakerTokenAmount;
            this.setState({
                didFillOrderSucceed: true,
                globalErrMsg: '',
                amountAlreadyFilled: this.state.amountAlreadyFilled.plus(orderFilledAmount),
            });
            return true;
        } catch (err) {
            const errMsg = `${err}`;
            if (_.includes(errMsg, 'User denied transaction signature')) {
                return false;
            }
            const fillTruncationErrMsg = constants.exchangeContractErrToMsg[
                ExchangeContractErrs.ERROR_FILL_TRUNCATION
            ];
            globalErrMsg = 'Failed to fill order, please refresh and try again';
            if (_.includes(errMsg, fillTruncationErrMsg)) {
                globalErrMsg = fillTruncationErrMsg;
            }
            utils.consoleLog(`${err}`);
            await errorReporter.reportAsync(err);
            this.setState({
                globalErrMsg,
            });
            return false;
        }
    }
    private addTokenToCustomTokensIfUnseen(orderToken: OrderToken) {
        const existingToken = this.props.tokenByAddress[orderToken.address];

        // If a token with the address already exists, we trust the tokens retrieved from the
        // tokenRegistry or supplied by the current user over ones from an orderJSON. Thus, we
        // do not add a customToken and will defer to the rest of the details associated to the existing
        // token with this address for the rest of it's metadata.
        const doesTokenWithAddressExist = !_.isUndefined(existingToken);
        if (doesTokenWithAddressExist) {
            return;
        }

        // Let's make sure this token (with a unique address), also have a unique name/symbol, otherwise
        // we append something to make it visibly clear to the end user that this is a different underlying
        // token then the identically named one they already had locally.
        const existingTokens = _.values(this.props.tokenByAddress);
        const isUniqueName = _.isUndefined(_.find(existingTokens, {name: orderToken.name}));
        if (!isUniqueName) {
            orderToken.name = `${orderToken.name} [Imported]`;
        }

        const isUniqueSymbol = _.isUndefined(_.find(existingTokens, {symbol: orderToken.symbol}));
        if (!isUniqueSymbol) {
            orderToken.symbol = this.addSymbolFlourish(orderToken.symbol);
        }

        // Add default token icon url
        const token: Token = {
            ...orderToken,
            iconUrl: constants.DEFAULT_TOKEN_ICON_URL,
            balance: new BigNumber(0),
            allowance: new BigNumber(0),
        };

        // Add the custom token to local storage and to the redux store
        customTokenStorage.addCustomToken(this.props.blockchain.networkId, token);
        this.props.dispatcher.addTokenToTokenByAddress(token);

        // FireAndForget update balance & allowance
        this.props.blockchain.updateTokenBalancesAndAllowancesAsync([token]);
    }
    private addSymbolFlourish(symbol: string) {
        return `*${symbol}*`;
    }
    private removeSymbolFlourishIfExists(symbol: string) {
        if (symbol[0] === '*' && symbol[symbol.length - 1] === '*') {
            const unflourishedSymbol = symbol.slice(1, -1);
            return unflourishedSymbol;
        } else {
            return symbol;
        }
    }
}
