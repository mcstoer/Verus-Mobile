import React from "react";
import { findCoinObj } from "../../utils/CoinData/CoinData";
import { 
  View, 
  RefreshControl,
} from "react-native";
import { Text, Provider, Portal } from 'react-native-paper';
import { truncateDecimal } from "../../utils/math";
import BigNumber from "bignumber.js";
import { HomeListItemThemeDark, HomeListItemThemeLight } from "./Home.themes";
import HomeFAB from "./HomeFAB/HomeFAB";
import CurrencyWidget from "./HomeWidgets/CurrencyWidget";
import { SortableContainer, SortableGrid, SortableTile } from "../../components/DragSort";
import { CURRENCY_WIDGET_TYPE, TOTAL_UNI_BALANCE_WIDGET_TYPE } from "../../utils/constants/widgets";
import { setAndSaveAccountWidgets } from "../../actions/actionCreators";
import TotalUniBalanceWidget from "./HomeWidgets/TotalUniBalanceWidget";
import ListSelectionModal from "../../components/ListSelectionModal/ListSelectionModal";
import { CURRENCY_NAMES, SUPPORTED_UNIVERSAL_DISPLAY_CURRENCIES } from "../../utils/constants/currencies";

export const HomeRender = function () {
  return (
    <Portal.Host>
      <Portal>
        {this.state.displayCurrencyModalOpen && (
          <ListSelectionModal
            title="Currencies"
            selectedKey={this.props.displayCurrency}
            visible={this.state.displayCurrencyModalOpen}
            onSelect={item => this.setDisplayCurrency(item.key)}
            data={SUPPORTED_UNIVERSAL_DISPLAY_CURRENCIES.map(key => {
              return {
                key,
                title: key,
                description: CURRENCY_NAMES[key],
              };
            })}
            cancel={() => this.setState({ displayCurrencyModalOpen: false })}
          />
        )}
      </Portal>
      <HomeFAB
        handleAddCoin={() => this._addCoin()}
        handleVerusPay={() => this._verusPay()}
      />
      {HomeRenderCoinsList.call(this)}
    </Portal.Host>
  );
};


export const HomeRenderWidget = function(widgetId) {
  const widgetSplit = widgetId.split(":")
  const widgetType = widgetSplit[0]

  const renderers = {
    [CURRENCY_WIDGET_TYPE]: () => {
      const coinId = widgetSplit[1]
      const coinObj = findCoinObj(coinId)

      const balance = this.state.totalCryptoBalances[coinObj.id] == null
          ? null
          : truncateDecimal(this.state.totalCryptoBalances[coinObj.id], 8)

      return (
        <Provider theme={HomeListItemThemeDark}>
          <CurrencyWidget currencyBalance={balance} coinObj={coinObj} />
        </Provider>
      );
    },
    [TOTAL_UNI_BALANCE_WIDGET_TYPE]: () => {          
      return (
        <Provider theme={HomeListItemThemeLight}>
          <TotalUniBalanceWidget totalBalance={this.state.totalFiatBalance}/>
        </Provider>
      );
    }
  };

  return renderers[widgetType] ? renderers[widgetType]() : <View />
}

export const HomeRenderCoinsList = function() {
  const { widgets } = this.state;

  return widgets.length == 0 ? (
    <View />
  ) : (
    <View
      style={{
        height: '100%',
        backgroundColor: 'white',
        width: '100%',
        overflow: 'visible',
      }}>
      <SortableContainer customconfig={{}}>
        <SortableGrid
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.forceUpdate}
            />
          }
          onPressDetected={(id) => this.handleWidgetPress(id)}
          editing={true}
          onDragEnd={positions =>
            this.props.dispatch(
              setAndSaveAccountWidgets(
                positions,
                this.props.activeAccount.accountHash,
              ),
            )
          }>
          {widgets.map((widgetId, index) => (
              <SortableTile key={index} id={widgetId}>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'visible',
                    paddingTop: 12,
                  }}>
                  {HomeRenderWidget.call(this, widgetId)}
                </View>
              </SortableTile>
            ))}
        </SortableGrid>
      </SortableContainer>
    </View>
  );
}

export const renderFiatBalance = function (balance, ticker) {
  const { displayCurrency } = this.props;
  const rate = this.getRate(ticker, displayCurrency);

  return (
    <Text>
      {(balance == null || rate == null
        ? "-"
        : truncateDecimal(BigNumber(rate).multipliedBy(BigNumber(balance)), 2)) +
        " " +
        displayCurrency}
    </Text>
  );
};

/**
 * Render a list item for a cryptocurrency in your wallet
 * @param {Object} coinObj The coin object
 * @param {Boolean} isParent Whether or not the list item is a parent
 * @param {Object} subWallet The subwallet (child only)
 */
export const HomeListItemRender = function(coinObj, isParent, subWallet, index = 0, length) {
  const balance = isParent
    ? (this.state.totalCryptoBalances[coinObj.id] == null
      ? null
      : truncateDecimal(this.state.totalCryptoBalances[coinObj.id], 8))
    : this.props.balances[coinObj.id] &&
      this.props.balances[coinObj.id][subWallet.id] != null
    ? truncateDecimal(this.props.balances[coinObj.id][subWallet.id].total, 8)
    : null;

  return (
    <Provider key={index} theme={HomeListItemThemeDark}>
      <CurrencyWidget 
        currencyBalance={balance}
        coinObj={coinObj}
      />
    </Provider>
  );
}