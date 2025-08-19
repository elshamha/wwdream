import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(AtticusWebviewApp());

class AtticusWebviewApp extends StatelessWidget {
  const AtticusWebviewApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: WebViewScreen());
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse('https://elshamha.pythonanywhere.com'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Atticus WebView')),
      body: WebViewWidget(controller: _controller),
    );
  }
}
