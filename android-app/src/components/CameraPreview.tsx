import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { RobotApi } from '../services/RobotApi';

interface Props {
  host: string;
  port: number;
  token: string;
  height?: number;
  aspectRatio?: number;
  showOverlay?: boolean;
  fps?: number;
  personDetected?: boolean;
}

export const CameraPreview: React.FC<Props> = ({
  host,
  port,
  token,
  height = 220,
  aspectRatio = 4 / 3,
  showOverlay = true,
  fps = 0,
  personDetected = false,
}) => {
  const [ticket, setTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchTicket() {
      if (!host || !port || !token) {
        return;
      }
      const t = await RobotApi.getCameraTicket(host, port, token);
      if (mounted && t) {
        setTicket(t);
        setLoading(false);
      }
    }

    fetchTicket();

    const interval = setInterval(fetchTicket, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [host, port, token]);

  const streamUrl = ticket
    ? `http://${host}:${port}/api/v1/camera/mjpeg?ticket=${ticket}`
    : `http://${host}:${port}/api/v1/camera/mjpeg?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body, html {
            margin: 0;
            padding: 0;
            background-color: #000000;
            width: 100%;
            height: 100%;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${streamUrl}" />
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height, aspectRatio }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00E676" />
          <Text style={styles.loadingText}>Loading CSI Camera Stream...</Text>
        </View>
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.webview}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}

      {showOverlay && (
        <View style={styles.overlayContainer}>
          <View style={styles.badgeLeft}>
            <Text style={styles.badgeText}>CAM CSI • {fps.toFixed(1)} FPS</Text>
          </View>
          {personDetected && (
            <View style={styles.badgeRight}>
              <Text style={styles.personWarningText}>PERSON DETECTED</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#263238',
    position: 'relative',
  },
  webview: {
    backgroundColor: '#000000',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888888',
    fontSize: 12,
    marginTop: 6,
  },
  overlayContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  badgeLeft: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeRight: {
    backgroundColor: 'rgba(213, 0, 0, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  personWarningText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
