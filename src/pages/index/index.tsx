import React, { useState, useRef, useEffect } from 'react'
import { chooseImage, showLoading, hideLoading, showToast } from '@tarojs/taro'
import { View, Image, Button, ScrollView, Text } from '@tarojs/components'
import { createWorker } from 'tesseract.js'
import './index.scss'

export default function Index() {
  const [imageUrl, setImageUrl] = useState('')
  const [recognizedText, setRecognizedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(-1)
  const workerRef = useRef(null)

  useEffect(() => {
    console.log('Index page mounted')
  }, [])

  const handleChooseImage = async () => {
    try {
      const res = await chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        const tempPath = res.tempFilePaths[0]
        setImageUrl(tempPath)
        setRecognizedText('')
        setProgress(0)
        await recognizeText(tempPath)
      }
    } catch (error) {
      showToast({
        title: '选择图片失败',
        icon: 'none'
      })
    }
  }

  const recognizeText = async (imagePath) => {
    setIsLoading(true)
    showLoading({ title: '识别中...' })

    try {
      if (!workerRef.current) {
        workerRef.current = await createWorker('chi_sim', 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100))
            }
          }
        })
      }

      const { data: { text } } = await workerRef.current.recognize(imagePath)
      setRecognizedText(text || '未能识别到文字')
      showToast({
        title: '识别成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('OCR Error:', error)
      setRecognizedText('识别失败，请重试')
      showToast({
        title: '识别失败',
        icon: 'none'
      })
    } finally {
      setIsLoading(false)
      hideLoading()
    }
  }

  const handleSpeak = () => {
    if (!recognizedText) {
      showToast({
        title: '请先识别图片',
        icon: 'none'
      })
      return
    }

    if (isPlaying) {
      speechSynthesis.cancel()
      setIsPlaying(false)
      setCurrentCharIndex(-1)
      return
    }

    showToast({
      title: '开始朗读',
      icon: 'none'
    })

    setCurrentCharIndex(0)
    const utterance = new SpeechSynthesisUtterance(recognizedText)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.9
    
    const charDuration = 1000 / (utterance.rate * 4)
    const highlightTimer = setInterval(() => {
      setCurrentCharIndex(prev => {
        if (prev >= recognizedText.length - 1) {
          clearInterval(highlightTimer)
          return -1
        }
        return prev + 1
      })
    }, charDuration)

    utterance.onend = () => {
      setIsPlaying(false)
      setCurrentCharIndex(-1)
      clearInterval(highlightTimer)
    }
    
    speechSynthesis.speak(utterance)
    setIsPlaying(true)
  }

  const handleClear = () => {
    if (isPlaying) {
      speechSynthesis.cancel()
      setIsPlaying(false)
    }
    setImageUrl('')
    setRecognizedText('')
    setProgress(0)
  }

  return (
    <View className="container">
      <View className="header">
        <View className="title">图片转语音</View>
        <View className="subtitle">上传图片，一键识别并朗读文字</View>
      </View>

      <View className="main-content">
        <View className="upload-area" onClick={handleChooseImage}>
          {imageUrl ? (
            <Image className="preview-image" src={imageUrl} mode="aspectFit" />
          ) : (
            <View className="upload-placeholder">
              <View className="upload-icon">📷</View>
              <View className="upload-text">点击上传图片</View>
              <View className="upload-hint">支持拍照或从相册选择</View>
            </View>
          )}
          {isLoading && (
            <View className="loading-overlay">
              <View className="loading-spinner"></View>
              <View className="loading-text">识别中 {progress}%</View>
            </View>
          )}
        </View>

        <View className="action-buttons">
          <Button className="btn-primary" onClick={handleChooseImage} disabled={isLoading}>
            {isLoading ? '识别中...' : '重新选择'}
          </Button>
          <Button className="btn-secondary" onClick={handleClear}>
            清空
          </Button>
        </View>

        {recognizedText && (
          <View className="result-section">
            <View className="result-header">
              <Text className="result-title">识别结果</Text>
              <Button className="speak-btn" onClick={handleSpeak}>
                {isPlaying ? '⏹️ 停止' : '🔊 朗读'}
              </Button>
            </View>
            <ScrollView className="text-content" scrollY>
              <Text className="recognized-text">
                {recognizedText.split('').map((char, index) => (
                  <Text 
                    key={index} 
                    className={index === currentCharIndex ? 'highlight' : ''}
                  >{char}</Text>
                ))}
              </Text>
            </ScrollView>
          </View>
        )}
      </View>

      <View className="footer">
        <Text>支持中文、英文等多种语言识别</Text>
      </View>
    </View>
  )
}