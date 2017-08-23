import * as _ from 'lodash';
import Web3 = require('web3');
import * as BigNumber from 'bignumber.js';
import promisify = require('es6-promisify');
import {Dispatcher} from 'ts/redux/dispatcher';

export class Web3Wrapper {
    private dispatcher: Dispatcher;
    private web3: Web3;
    private prevNetworkId: number;
    private shouldPollUserAddress: boolean;
    private watchNetworkAndBalanceIntervalId: number;
    private prevUserEtherBalanceInEth: BigNumber.BigNumber;
    private prevUserAddress: string;
    constructor(dispatcher: Dispatcher, provider: Web3.Provider, networkIdIfExists: number,
                shouldPollUserAddress: boolean) {
        this.dispatcher = dispatcher;
        this.prevNetworkId = networkIdIfExists;
        this.shouldPollUserAddress = shouldPollUserAddress;

        this.web3 = new Web3();
        this.web3.setProvider(provider);

        this.startEmittingNetworkConnectionAndUserBalanceStateAsync();
    }
    public isAddress(address: string) {
        return this.web3.isAddress(address);
    }
    public async getAccountsAsync(): Promise<string[]> {
        const addresses = await promisify(this.web3.eth.getAccounts)();
        return addresses;
    }
    public async getFirstAccountIfExistsAsync() {
        const addresses = await this.getAccountsAsync();
        if (_.isEmpty(addresses)) {
            return '';
        }
        return (addresses as string[])[0];
    }
    public async getNodeVersionAsync() {
        const nodeVersion = await promisify(this.web3.version.getNode)();
        return nodeVersion;
    }
    public getProviderObj() {
        return this.web3.currentProvider;
    }
    public async getNetworkIdIfExists() {
        try {
            const networkId = await this.getNetworkAsync();
            return Number(networkId);
        } catch (err) {
            return undefined;
        }
    }
    public async getBalanceInEthAsync(owner: string): Promise<BigNumber.BigNumber> {
        const balanceInWei: BigNumber.BigNumber = await promisify(this.web3.eth.getBalance)(owner);
        const balanceEthOldBigNumber = this.web3.fromWei(balanceInWei, 'ether');
        const balanceEth = new BigNumber(balanceEthOldBigNumber);
        return balanceEth;
    }
    public async doesContractExistAtAddressAsync(address: string): Promise<boolean> {
        const code = await promisify(this.web3.eth.getCode)(address);
        // Regex matches 0x0, 0x00, 0x in order to accomodate poorly implemented clients
        const zeroHexAddressRegex = /^0[xX][0]*$/;
        const didFindCode = _.isNull(code.match(zeroHexAddressRegex));
        return didFindCode;
    }
    public async signTransactionAsync(address: string, message: string): Promise<string> {
        const signData = await promisify(this.web3.eth.sign)(address, message);
        return signData;
    }
    public async getBlockTimestampAsync(blockHash: string): Promise<number> {
        const {timestamp} = await promisify(this.web3.eth.getBlock)(blockHash);
        return timestamp;
    }
    public destroy() {
        this.stopEmittingNetworkConnectionAndUserBalanceStateAsync();
        // HACK: stop() is only available on providerEngine instances
        const provider = this.web3.currentProvider;
        if (!_.isUndefined((provider as any).stop)) {
            (provider as any).stop();
        }
    }
    // This should only be called from the LedgerConfigDialog
    public updatePrevUserAddress(userAddress: string) {
        this.prevUserAddress = userAddress;
    }
    private async getNetworkAsync() {
        const networkId = await promisify(this.web3.version.getNetwork)();
        return networkId;
    }
    private async startEmittingNetworkConnectionAndUserBalanceStateAsync() {
        if (!_.isUndefined(this.watchNetworkAndBalanceIntervalId)) {
            return; // we are already emitting the state
        }

        let prevNodeVersion: string;
        this.prevUserEtherBalanceInEth = new BigNumber(0);
        this.dispatcher.updateNetworkId(this.prevNetworkId);
        this.watchNetworkAndBalanceIntervalId = window.setInterval(async () => {
            // Check for network state changes
            const currentNetworkId = await this.getNetworkIdIfExists();
            if (currentNetworkId !== this.prevNetworkId) {
                this.prevNetworkId = currentNetworkId;
                this.dispatcher.updateNetworkId(currentNetworkId);
            }

            // Check for node version changes
            const currentNodeVersion = await this.getNodeVersionAsync();
            if (currentNodeVersion !== prevNodeVersion) {
                prevNodeVersion = currentNodeVersion;
                this.dispatcher.updateNodeVersion(currentNodeVersion);
            }

            if (this.shouldPollUserAddress) {
                const userAddressIfExists = await this.getFirstAccountIfExistsAsync();
                // Update makerAddress on network change
                if (this.prevUserAddress !== userAddressIfExists) {
                    this.prevUserAddress = userAddressIfExists;
                    this.dispatcher.updateUserAddress(userAddressIfExists);
                }

                // Check for user ether balance changes
                if (userAddressIfExists !== '') {
                    await this.updateUserEtherBalanceAsync(userAddressIfExists);
                }
            } else {
                // This logic is primarily for the Ledger, since we don't regularly poll for the address
                // we simply update the balance for the last fetched address.
                if (!_.isEmpty(this.prevUserAddress)) {
                    await this.updateUserEtherBalanceAsync(this.prevUserAddress);
                }
            }
        }, 5000);
    }
    private async updateUserEtherBalanceAsync(userAddress: string) {
        const balance = await this.getBalanceInEthAsync(userAddress);
        if (!balance.eq(this.prevUserEtherBalanceInEth)) {
            this.prevUserEtherBalanceInEth = balance;
            this.dispatcher.updateUserEtherBalance(balance);
        }
    }
    private stopEmittingNetworkConnectionAndUserBalanceStateAsync() {
        clearInterval(this.watchNetworkAndBalanceIntervalId);
    }
}
