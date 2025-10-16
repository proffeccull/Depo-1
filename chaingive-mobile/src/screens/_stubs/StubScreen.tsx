import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  name: string;
}

const StubScreen: React.FC<Props> = ({ name }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{name} (stub)</Text>
    </View>
  );
};

export default StubScreen;

