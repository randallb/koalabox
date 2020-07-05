/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import * as React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  FlatList,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const {useState, useEffect} = React;

const App: () => React$Node = () => {
  const [todos, setTodos] = useState({});
  const getData = async () => {
    const response = await fetch('http://localhost:3000/');
    const data = await response.json();
    setTodos(data);
  };
  useEffect(() => {
    getData();
  }, []);
  console.log(todos);
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={Object.entries(todos)}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text>{item.title}</Text>
          </View>
        )}
        keyExtractor={item => `${Math.random()}`}
      />
      <Button
        title={'hi'}
        onPress={() => {
          fetch('http://localhost:3000/newTodo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: `${Math.floor(Math.random() * 100)} lols`,
            }),
          });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});


export default App;
