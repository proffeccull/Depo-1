import 'package:flutter/material.dart';

class DonationHistoryScreen extends StatelessWidget {
  const DonationHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Donation History')),
      body: const Center(child: Text('Donation History Screen')),
    );
  }
}
