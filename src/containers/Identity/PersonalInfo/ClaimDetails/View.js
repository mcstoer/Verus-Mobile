import React, { useState, useEffect } from 'react';
import {
  View, Text, Platform, TouchableOpacity,
} from 'react-native';
import { SearchBar, ListItem, Button } from 'react-native-elements';
import { Map as IMap } from 'immutable';
import { ScrollView } from 'react-native-gesture-handler';
import Styles from '../../../../styles';
import Colors from '../../../../globals/colors';
import AttestationDetails from '../../Home/AttestationDetails';
import RequestAttestation from '../RequestAttestation';
import { truncateString } from '../ClaimManager/utils/truncateString';
import withNavigationFocus from "react-navigation/src/views/withNavigationFocus";
//import { useFocusEffect } from '@react-navigation/native';

const getClaimData = (name) => {
  if (name.length > 20) return `${truncateString(name, 20)}...`;
  return name;
};

const ClaimDetails = (props) => {
  const {
    navigation,
    actions: { setActiveAttestationId, setActiveClaim, setAttestationModalVisibility },
    attestationsData,
    childClaims,
    parentClaims,
    attestationModalVisibility,
    claims,
    isFocused
  } = props;

  const [attestations, setAttestation] = useState(attestationsData);
  const [value, setValue] = useState('');
  const [identityAttested, setIdentityAttested] = useState('');
  const [requestAttestationModalShown, setRequestAttestationModalShown] = useState(false);
  const claimUid = navigation.state.params.claimUid;

  /*useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused")

      return () => {
        console.log("Screen unfocused")
      }
    }, [])
  );*/

  useEffect(() => {
    if (isFocused === true) {
      setActiveClaim(claims.get(claimUid))
    }
  }, [isFocused])

  useEffect(() => {
    setAttestation(attestationsData);
  }, [attestationsData]);

  const updateSearch = (value) => {
    const newData = attestationsData.filter((item) => {
      const itemData = item.get('identityAttested', '').toUpperCase();
      const textData = value.toUpperCase();
      return itemData.includes(textData);
    });
    setAttestation(newData);
    setValue(value);
  };

  const getClaimsDetails = (claim) => {
    navigation.navigate('ClaimDetails', {
      claimUid: claim.get('uid', '')
    });
  };

  const goToAttestationDetails = (attestation) => {
    setActiveAttestationId(attestation.get('uid', ''));
    setIdentityAttested(attestation.get('identityAttested', ''));
    setAttestationModalVisibility(true);
  };

  const claimList = (_claims, item, type) => (
    <TouchableOpacity
      key={_claims.getIn([item, "uid"])}
      style={Styles.greyButtonWithShadow}
      onPress={() => getClaimsDetails(_claims.get(item), type)}
    >
      <View>
        <Text style={Styles.textWithLeftPadding}>
          {_claims.getIn([item, "displayName"])}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={Styles.root}>
      <View style={Styles.alignItemsCenter}>
        <Text style={Styles.boldText}>
          {claims.getIn([claimUid, 'displayName'])}
          :
        </Text>
        <Text style={Styles.boldText}>
          {' '}
          {getClaimData(claims.getIn([claimUid, 'data']))}
        </Text>
      </View>
      <SearchBar
        containerStyle={Styles.backgroundColorWhite}
        platform={Platform.OS === 'ios' ? 'ios' : 'android'}
        placeholder="Search Attestaions"
        onChangeText={updateSearch}
        value={value}
        inputContainerStyle={Styles.defaultMargin}
        cancelButtonTitle=""
      />
      <ScrollView>
        <View>
          <Text style={[Styles.labelUltraLightGrey, Styles.paddingTop]}>ATTESTED TO BY</Text>
          {attestations.keySeq().map((attestation) => (
            <ListItem
              key={attestations.getIn([attestation, 'uid'], '')}
              title={attestations.getIn([attestation, 'identityAttested'], '')}
              onPress={() => goToAttestationDetails(attestations.get(attestation, IMap()))}
              bottomDivider
              chevron
            />
          ))}
        </View>
        <Button
          title="Request attestation"
          color={Colors.primaryColor}
          style={Styles.paddingTop}
          onPress={() => setRequestAttestationModalShown(true)}
        />
        <View>
          {childClaims.size > 0
            ? <Text style={[Styles.textWithTopMargin, Styles.boldText]}>Child Claims</Text> : null}
          {childClaims.keySeq().map((item) => (
            claimList(childClaims, item)
          ))}
          {parentClaims.size > 0
            ? <Text style={[Styles.textWithTopMargin, Styles.boldText]}>Parent Claims</Text> : null}
          {parentClaims.keySeq().map((item) => (
            claimList(parentClaims, item)
          ))}
        </View>
      </ScrollView>
      <AttestationDetails
        visible={attestationModalVisibility}
        claimData={claims.get(claimUid)}
        identityAttested={identityAttested}
      />
      <RequestAttestation
        visible={requestAttestationModalShown}
        setRequestAttestationModalShown={setRequestAttestationModalShown}
      />
    </View>
  );
};

export default withNavigationFocus(ClaimDetails);
