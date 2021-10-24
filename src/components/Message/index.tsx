import React from 'react'
import { View, Text, DatePickerIOSBase, Dimensions } from 'react-native'
import { MotiView } from 'moti'

import { UserPhoto } from '../UserPhoto'
import { styles } from './styles'

export type MessageProps = {
    id: string,
    text: string,
    user: {
        name: string,
        avatar_url: string,
    }
}

type Props = {
    data: MessageProps
}

export function Message({ data }: Props) {
    return (
        <MotiView
            style={styles.container}
            from={{ opacity: 0, translateX: Dimensions.get('screen').width + 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 700 }}
        >
            <Text style={styles.message}>
                {data.text}
            </Text>

            <View style={styles.footer}>
                <UserPhoto
                    imageUri={data.user.avatar_url}
                    sizes='SMALL'
                />

                <Text style={styles.useName}>{data.user.name}</Text>
            </View>
        </MotiView>
    )
}