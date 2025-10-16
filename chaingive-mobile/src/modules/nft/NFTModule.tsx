import React from 'react';
import { View, Text } from 'react-native';

interface NFTModuleProps {
  component: string;
}

const NFTGallery = () => <View><Text>NFT Gallery</Text></View>;
const NFTMinting = () => <View><Text>NFT Minting</Text></View>;

const components = {
  NFTGallery,
  NFTMinting,
};

export default function NFTModule({ component }: NFTModuleProps) {
  const Component = components[component as keyof typeof components];
  return Component ? <Component /> : <Text>Component not found</Text>;
}