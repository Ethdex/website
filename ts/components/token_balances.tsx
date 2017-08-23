import * as _ from 'lodash';
import * as React from 'react';
import {ZeroEx} from '0x.js';
import DharmaLoanFrame from 'dharma-loan-frame';
import {colors} from 'material-ui/styles';
import Dialog from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {
    Table,
    TableBody,
    TableHeader,
    TableRow,
    TableHeaderColumn,
    TableRowColumn,
} from 'material-ui/Table';
import ReactTooltip = require('react-tooltip');
import * as BigNumber from 'bignumber.js';
import firstBy = require('thenby');
import QueryString = require('query-string');
import {Dispatcher} from 'ts/redux/dispatcher';
import {
    TokenByAddress,
    Token,
    BlockchainErrs,
    BalanceErrs,
    Styles,
    ScreenWidths,
    EtherscanLinkSuffixes,
    BlockchainCallErrs,
} from 'ts/types';
import {Blockchain} from 'ts/blockchain';
import {utils} from 'ts/utils/utils';
import {constants} from 'ts/utils/constants';
import {configs} from 'ts/utils/configs';
import {LifeCycleRaisedButton} from 'ts/components/ui/lifecycle_raised_button';
import {HelpTooltip} from 'ts/components/ui/help_tooltip';
import {errorReporter} from 'ts/utils/error_reporter';
import {AllowanceToggle} from 'ts/components/inputs/allowance_toggle';
import {EthWethConversionButton} from 'ts/components/eth_weth_conversion_button';

const ETHER_ICON_PATH = '/images/ether.png';
const ETHER_TOKEN_SYMBOL = 'WETH';
const ZRX_TOKEN_SYMBOL = 'ZRX';

const PRECISION = 5;
const ICON_DIMENSION = 40;
const ARTIFICIAL_ETHER_REQUEST_DELAY = 1000;
const TOKEN_TABLE_ROW_HEIGHT = 60;
const MAX_TOKEN_TABLE_HEIGHT = 420;
const TOKEN_COL_SPAN_LG = 2;
const TOKEN_COL_SPAN_SM = 1;

const styles: Styles = {
    bgColor: {
        backgroundColor: colors.grey50,
    },
};

interface TokenBalancesProps {
    blockchain: Blockchain;
    blockchainErr: BlockchainErrs;
    blockchainIsLoaded: boolean;
    dispatcher: Dispatcher;
    screenWidth: ScreenWidths;
    tokenByAddress: TokenByAddress;
    userAddress: string;
    userEtherBalance: BigNumber.BigNumber;
    networkId: number;
}

interface TokenBalancesState {
    errorType: BalanceErrs;
    isBalanceSpinnerVisible: boolean;
    isDharmaDialogVisible: boolean;
}

export class TokenBalances extends React.Component<TokenBalancesProps, TokenBalancesState> {
    public constructor(props: TokenBalancesProps) {
        super(props);
        this.state = {
            errorType: undefined,
            isBalanceSpinnerVisible: false,
            isDharmaDialogVisible: DharmaLoanFrame.isAuthTokenPresent(),
        };
    }
    public componentWillReceiveProps(nextProps: TokenBalancesProps) {
        if (nextProps.userEtherBalance !== this.props.userEtherBalance) {
            if (this.state.isBalanceSpinnerVisible) {
                const receivedAmount = nextProps.userEtherBalance.minus(this.props.userEtherBalance);
                this.props.dispatcher.showFlashMessage(`Received ${receivedAmount.toString(10)} test Ether`);
            }
            this.setState({
                isBalanceSpinnerVisible: false,
            });
        }
    }
    public componentDidMount() {
        window.scrollTo(0, 0);
    }
    public render() {
        const errorDialogActions = [
            <FlatButton
                label="Ok"
                primary={true}
                onTouchTap={this.onErrorDialogToggle.bind(this, false)}
            />,
        ];
        const dharmaDialogActions = [
            <FlatButton
                label="Close"
                primary={true}
                onTouchTap={this.onDharmaDialogToggle.bind(this, false)}
            />,
        ];
        const isTestNetwork = this.props.networkId === constants.TESTNET_NETWORK_ID;
        const dharmaButtonColumnStyle = {
            paddingLeft: 3,
            display: isTestNetwork ? 'table-cell' : 'none',
        };
        const stubColumnStyle = {
            display: isTestNetwork ? 'none' : 'table-cell',
        };
        const allTokenRowHeight = _.size(this.props.tokenByAddress) * TOKEN_TABLE_ROW_HEIGHT;
        const tokenTableHeight = allTokenRowHeight < MAX_TOKEN_TABLE_HEIGHT ?
                                 allTokenRowHeight :
                                 MAX_TOKEN_TABLE_HEIGHT;
        const isSmallScreen = this.props.screenWidth === ScreenWidths.SM;
        const tokenColSpan = isSmallScreen ? TOKEN_COL_SPAN_SM : TOKEN_COL_SPAN_LG;
        const dharmaLoanExplanation = 'If you need access to larger amounts of ether,<br> \
                                     you can request a loan from the Dharma Loan<br> \
                                     network.  Your loan should be funded in 5<br>  \
                                     minutes or less.';
        const allowanceExplanation = '0x smart contracts require access to your<br> \
                                  token balances in order to execute trades.<br> \
                                  Toggling permissions sets an allowance for the<br> \
                                  smart contract so you can start trading that token.';
        return (
            <div className="lg-px4 md-px4 sm-px1 pb2">
                <h3>{isTestNetwork ? 'Test ether' : 'Ether'}</h3>
                <Divider />
                <div className="pt2 pb2">
                    {isTestNetwork ?
                        'In order to try out the 0x OTC Dapp, request some test ether to pay for \
                        gas costs. It might take a bit of time for the test ether to show up.' :
                        'Ether must be converted to Ether Tokens in order to be tradable via 0x. \
                         You can convert between Ether and Ether Tokens by clicking the "convert" button below.'
                    }
                </div>
                <Table
                    selectable={false}
                    style={styles.bgColor}
                >
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn>Currency</TableHeaderColumn>
                            <TableHeaderColumn>Balance</TableHeaderColumn>
                            <TableRowColumn
                                className="sm-hide xs-hide"
                                style={stubColumnStyle}
                            />
                            {
                                isTestNetwork &&
                                <TableHeaderColumn
                                    style={{paddingLeft: 3}}
                                >
                                    {isSmallScreen ? 'Faucet' : 'Request from faucet'}
                                </TableHeaderColumn>
                            }
                            {
                                isTestNetwork &&
                                <TableHeaderColumn
                                    style={dharmaButtonColumnStyle}
                                >
                                    {isSmallScreen ? 'Loan' : 'Request Dharma loan'}
                                    <HelpTooltip
                                        style={{paddingLeft: 4}}
                                        explanation={dharmaLoanExplanation}
                                    />
                                </TableHeaderColumn>
                            }
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        <TableRow key="ETH">
                            <TableRowColumn className="py1">
                                <img
                                    style={{width: ICON_DIMENSION, height: ICON_DIMENSION}}
                                    src={ETHER_ICON_PATH}
                                />
                            </TableRowColumn>
                            <TableRowColumn>
                                {this.props.userEtherBalance.toFixed(PRECISION)} ETH
                                {this.state.isBalanceSpinnerVisible &&
                                    <span className="pl1">
                                        <i className="zmdi zmdi-spinner zmdi-hc-spin" />
                                    </span>
                                }
                            </TableRowColumn>
                            <TableRowColumn
                                className="sm-hide xs-hide"
                                style={stubColumnStyle}
                            />
                            {
                                isTestNetwork &&
                                <TableRowColumn style={{paddingLeft: 3}}>
                                    <LifeCycleRaisedButton
                                        labelReady="Request"
                                        labelLoading="Sending..."
                                        labelComplete="Sent!"
                                        onClickAsyncFn={this.requestEtherAsync.bind(this)}
                                    />
                                </TableRowColumn>
                            }
                            {
                                isTestNetwork &&
                                <TableRowColumn style={dharmaButtonColumnStyle}>
                                    <RaisedButton
                                        label="Request"
                                        style={{width: '100%'}}
                                        onTouchTap={this.onDharmaDialogToggle.bind(this)}
                                    />
                                </TableRowColumn>
                            }
                        </TableRow>
                    </TableBody>
                </Table>
                <h3 className="pt2">{isTestNetwork ? 'Test tokens' : 'Tokens'}</h3>
                <Divider />
                <div className="pt2 pb2">
                    {isTestNetwork ?
                        'Mint some test tokens you\'d like to use to generate or fill an order using 0x.' :
                        'Tokens supported by OTC are pulled from the 0x token registry smart contract.'
                    }
                </div>
                <Table
                    selectable={false}
                    bodyStyle={{height: tokenTableHeight}}
                    style={styles.bgColor}
                >
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn
                                colSpan={tokenColSpan}
                            >
                                Token
                            </TableHeaderColumn>
                            <TableHeaderColumn style={{paddingLeft: 3}}>Balance</TableHeaderColumn>
                            <TableHeaderColumn>
                                <div className="inline-block">{!isSmallScreen && 'Trade '}Permissions</div>
                                <HelpTooltip
                                    style={{paddingLeft: 4}}
                                    explanation={allowanceExplanation}
                                />
                            </TableHeaderColumn>
                            <TableHeaderColumn>
                                {isTestNetwork &&
                                    `Mint${!isSmallScreen ? ' test tokens' : ''}`
                                }
                            </TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {this.renderTableRows()}
                    </TableBody>
                </Table>
                <Dialog
                    title="Oh oh"
                    titleStyle={{fontWeight: 100}}
                    actions={errorDialogActions}
                    open={!_.isUndefined(this.state.errorType)}
                    onRequestClose={this.onErrorDialogToggle.bind(this, false)}
                >
                    {this.renderErrorDialogBody()}
                </Dialog>
                <Dialog
                    title="Request Dharma Loan"
                    titleStyle={{fontWeight: 100, backgroundColor: 'rgb(250, 250, 250)'}}
                    bodyStyle={{backgroundColor: 'rgb(37, 37, 37)'}}
                    actionsContainerStyle={{backgroundColor: 'rgb(250, 250, 250)'}}
                    autoScrollBodyContent={true}
                    actions={dharmaDialogActions}
                    open={this.state.isDharmaDialogVisible}
                >
                    {this.renderDharmaLoanFrame()}
                </Dialog>
            </div>
        );
    }
    private renderTableRows() {
        if (!this.props.blockchainIsLoaded || this.props.blockchainErr !== '') {
            return '';
        }
        const isSmallScreen = this.props.screenWidth === ScreenWidths.SM;
        const tokenColSpan = isSmallScreen ? TOKEN_COL_SPAN_SM : TOKEN_COL_SPAN_LG;
        const actionPaddingX = isSmallScreen ? 2 : 24;
        const tokens = _.values(this.props.tokenByAddress);
        const tokensStartingWithEtherToken = tokens.sort(
            firstBy((t: Token) => (t.symbol !== ETHER_TOKEN_SYMBOL))
            .thenBy((t: Token) => (t.symbol !== ZRX_TOKEN_SYMBOL))
            .thenBy('address'),
        );
        const tableRows = _.map(
            tokensStartingWithEtherToken,
            this.renderTokenRow.bind(this, tokenColSpan, actionPaddingX),
        );
        return tableRows;
    }
    private renderTokenRow(tokenColSpan: number, actionPaddingX: number, token: Token) {
        const tokenLink = utils.getEtherScanLinkIfExists(token.address, this.props.networkId,
                                                         EtherscanLinkSuffixes.address);
        const isMintable = _.includes(configs.symbolsOfMintableTokens, token.symbol) &&
            this.props.networkId !== constants.MAINNET_NETWORK_ID;
        return (
            <TableRow key={token.address} style={{height: TOKEN_TABLE_ROW_HEIGHT}}>
                <TableRowColumn
                    colSpan={tokenColSpan}
                >
                    {_.isUndefined(tokenLink) ?
                        this.renderTokenName(token) :
                        <a href={tokenLink} target="_blank" style={{textDecoration: 'none'}}>
                            {this.renderTokenName(token)}
                        </a>
                    }
                </TableRowColumn>
                <TableRowColumn style={{paddingRight: 3, paddingLeft: 3}}>
                    {this.renderAmount(token.balance, token.decimals)} {token.symbol}
                </TableRowColumn>
                <TableRowColumn>
                    <AllowanceToggle
                        blockchain={this.props.blockchain}
                        dispatcher={this.props.dispatcher}
                        token={token}
                        onErrorOccurred={this.onErrorOccurred.bind(this)}
                        userAddress={this.props.userAddress}
                    />
                </TableRowColumn>
                <TableRowColumn
                    style={{paddingLeft: actionPaddingX, paddingRight: actionPaddingX}}
                >
                    {isMintable &&
                        <LifeCycleRaisedButton
                            labelReady="Mint"
                            labelLoading="Minting..."
                            labelComplete="Minted!"
                            onClickAsyncFn={this.onMintTestTokensAsync.bind(this, token)}
                        />
                    }
                    {token.symbol === ETHER_TOKEN_SYMBOL &&
                        <EthWethConversionButton
                            blockchain={this.props.blockchain}
                            dispatcher={this.props.dispatcher}
                            ethToken={this.getWrappedEthToken()}
                            userEtherBalance={this.props.userEtherBalance}
                            onError={this.onEthWethConversionFailed.bind(this)}
                        />
                    }
                </TableRowColumn>
            </TableRow>
        );
    }
    private onEthWethConversionFailed() {
        this.setState({
            errorType: BalanceErrs.wethConversionFailed,
        });
    }
    private renderAmount(amount: BigNumber.BigNumber, decimals: number) {
        const unitAmount = ZeroEx.toUnitAmount(amount, decimals);
        return unitAmount.toNumber().toFixed(PRECISION);
    }
    private renderTokenName(token: Token) {
        const tooltipId = `tooltip-${token.address}`;
        return (
            <div className="flex">
                <div>
                    <img
                        style={{width: ICON_DIMENSION, height: ICON_DIMENSION}}
                        src={token.iconUrl}
                    />
                </div>
                <div
                    data-tip={true}
                    data-for={tooltipId}
                    className="mt2 ml2 sm-hide xs-hide"
                >
                    {token.name}
                </div>
                <ReactTooltip id={tooltipId}>{token.address}</ReactTooltip>
            </div>
        );
    }
    private renderErrorDialogBody() {
        switch (this.state.errorType) {
            case BalanceErrs.incorrectNetworkForFaucet:
                return (
                    <div>
                        Our faucet can only send test Ether to addresses on the {constants.TESTNET_NAME}
                        {' '}testnet (networkId {constants.TESTNET_NETWORK_ID}). Please make sure you are
                        {' '}connected to the {constants.TESTNET_NAME} testnet and try requesting ether again.
                    </div>
                );

            case BalanceErrs.faucetRequestFailed:
                return (
                    <div>
                        An unexpected error occurred while trying to request test Ether from our faucet.
                        {' '}Please refresh the page and try again.
                    </div>
                );

            case BalanceErrs.faucetQueueIsFull:
                return (
                    <div>
                        Our test Ether faucet queue is full. Please try requesting test Ether again later.
                    </div>
                );

            case BalanceErrs.mintingFailed:
                return (
                    <div>
                        Minting your test tokens failed unexpectedly. Please refresh the page and try again.
                    </div>
                );

            case BalanceErrs.wethConversionFailed:
                return (
                    <div>
                        Converting between Ether and Ether Tokens failed unexpectedly.
                        Please refresh the page and try again.
                    </div>
                );

            case BalanceErrs.allowanceSettingFailed:
                return (
                    <div>
                        An unexpected error occurred while trying to set your test token allowance.
                        {' '}Please refresh the page and try again.
                    </div>
                );

            case undefined:
                return null; // No error to show

            default:
                throw utils.spawnSwitchErr('errorType', this.state.errorType);
        }
    }
    private renderDharmaLoanFrame() {
        if (utils.isUserOnMobile()) {
            return (
                <h4 style={{ textAlign: 'center' }}>
                    We apologize -- Dharma loan requests are not available on
                    mobile yet.  Please try again through your desktop browser.
                </h4>
            );
        } else {
            return (
                <DharmaLoanFrame
                    partner="0x"
                    env={utils.getCurrentEnvironment()}
                    screenWidth={this.props.screenWidth}
                />
            );
        }
    }
    private onErrorOccurred(errorType: BalanceErrs) {
        this.setState({
            errorType,
        });
    }
    private async onMintTestTokensAsync(token: Token): Promise<boolean> {
        try {
            await this.props.blockchain.mintTestTokensAsync(token);
            const amount = ZeroEx.toUnitAmount(constants.MINT_AMOUNT, token.decimals);
            this.props.dispatcher.showFlashMessage(`Successfully minted ${amount.toString(10)} ${token.symbol}`);
            return true;
        } catch (err) {
            const errMsg = '' + err;
            if (_.includes(errMsg, BlockchainCallErrs.USER_HAS_NO_ASSOCIATED_ADDRESSES)) {
                this.props.dispatcher.updateShouldBlockchainErrDialogBeOpen(true);
                return false;
            }
            if (_.includes(errMsg, 'User denied transaction')) {
                return false;
            }
            utils.consoleLog(`Unexpected error encountered: ${err}`);
            utils.consoleLog(err.stack);
            await errorReporter.reportAsync(err);
            this.setState({
                errorType: BalanceErrs.mintingFailed,
            });
            return false;
        }
    }
    private async requestEtherAsync(): Promise<boolean> {
        if (this.props.userAddress === '') {
            this.props.dispatcher.updateShouldBlockchainErrDialogBeOpen(true);
            return false;
        }

        // If on another network other then the testnet our faucet serves test ether
        // from, we must show user an error message
        if (this.props.blockchain.networkId !== constants.TESTNET_NETWORK_ID) {
            this.setState({
                errorType: BalanceErrs.incorrectNetworkForFaucet,
            });
            return false;
        }

        await utils.sleepAsync(ARTIFICIAL_ETHER_REQUEST_DELAY);

        const response = await fetch(`${constants.ETHER_FAUCET_ENDPOINT}/${this.props.userAddress}`);
        const responseBody = await response.text();
        if (response.status !== constants.SUCCESS_STATUS) {
            utils.consoleLog(`Unexpected status code: ${response.status} -> ${responseBody}`);
            await errorReporter.reportAsync(new Error(`Faucet returned non-200: ${JSON.stringify(response)}`));
            const errorType = response.status === constants.UNAVAILABLE_STATUS ?
                              BalanceErrs.faucetQueueIsFull :
                              BalanceErrs.faucetRequestFailed;
            this.setState({
                errorType,
            });
            return false;
        }

        this.setState({
            isBalanceSpinnerVisible: true,
        });
        return true;
    }
    private onErrorDialogToggle(isOpen: boolean) {
        this.setState({
            errorType: undefined,
        });
    }
    private onDharmaDialogToggle() {
        this.setState({
            isDharmaDialogVisible: !this.state.isDharmaDialogVisible,
        });
    }
    private getWrappedEthToken() {
        const tokens = _.values(this.props.tokenByAddress);
        const wrappedEthToken = _.find(tokens, {symbol: ETHER_TOKEN_SYMBOL});
        return wrappedEthToken;
    }
}
