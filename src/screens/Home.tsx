import React from 'react'
import { View, Button,Text } from 'react-native'

export default function Home({navigation}:any): JSX.Element {
  return (
    <View>
      <Text>Home</Text>
      <Button
        title="Go to Movie Detail" // Teks pada tombol
        onPress={() => navigation.navigate('MovieDetail')} // Fungsi yang dipanggil saat tombol ditekan
      />
    </View>
  )
}