import 'package:flutter/material.dart';

class AIDashboardScreen extends StatelessWidget {
  const AIDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Dashboard')),
      body: const Center(child: Text('AI Dashboard Screen')),
    );
  }
}
