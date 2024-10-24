import { useLocalSearchParams } from 'expo-router'
import React from 'react'

const ActiveOrder = () => {
    const {index} = useLocalSearchParams()
    console.log(index)
  return (
    <View>
        <Text>Hello</Text>
    </View>
  )
}

export default ActiveOrder