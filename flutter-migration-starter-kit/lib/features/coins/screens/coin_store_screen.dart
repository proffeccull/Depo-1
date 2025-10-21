import 'package:flutter/material.dart';

class CoinStoreScreen extends StatelessWidget {
  const CoinStoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Coin Store')),
      body: const Center(child: Text('Coin Store Screen')),
    );
  }
}
