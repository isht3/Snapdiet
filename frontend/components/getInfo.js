import React, { Component } from "react";
import {
  View,
  TextInput,
  Switch,
  Picker,
  StyleSheet,
  ScrollView,
  AsyncStorage,
  ToastAndroid,
  TouchableHighlight
} from "react-native";
import { Text } from "native-base";
import { connect } from "react-redux";

class GetInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userInfo: {
        age: "",
        weight: "",
        height: "",
        lifeStyles: "A",
        gender: "M"
      },
      imperial: false,
      wUnits: "kg",
      hUnits: "cm"
    };
  }

  handleSubmit = () => {
    //Converting height from cm to inches and weight from kg to pounds
    if (this.state.imperial == false) {
      height = parseInt(this.state.userInfo.height) * 0.393701;
      weight = parseInt(this.state.userInfo.weight) * 2.20462;
    } else {
      height = parseInt(this.state.userInfo.height);
      weight = parseInt(this.state.userInfo.weight);
    }
    age = parseInt(this.state.userInfo.age);
    lifeStyle = this.state.userInfo.lifeStyles;
    activityLevel = 1.2;
    dailyGoal = 0;

    if (this.state.userInfo.gender === "M")
      dailyGoal = 12.7 * height + 6.23 * weight - 6.8 * age + 66;
    else dailyGoal = 4.7 * height + 4.35 * weight - 4.7 * age + 655;

    switch (lifeStyle) {
      case "A":
        dailyGoal *= 1.2;
        break;
      case "B":
        dailyGoal *= 1.375;
        break;
      case "C":
        dailyGoal *= 1.55;
        break;
      case "D":
        dailyGoal *= 1.725;
        break;
      case "E":
        dailyGoal *= 1.9;
        break;
    }
    dailyGoal = Math.floor(dailyGoal);
    this.props.update("updateGoal", { dailyGoal: dailyGoal });
    AsyncStorage.setItem("SNAPDIET_DAILYGOAL", dailyGoal.toString());

    this.props.update("updateInfo", { userInfo: this.state.userInfo });
    AsyncStorage.setItem(
      "SNAPDIET_USERINFO",
      JSON.stringify(this.state.userInfo)
    );
    AsyncStorage.setItem("SNAPDIET_FIRSTLAUNCH", "1");
    ToastAndroid.show("Information saved!", ToastAndroid.LONG);
    this.props.navigation.goBack();
  };

  componentWillMount() {
    getUserInfoOffline = async () => {
      await AsyncStorage.getItem("SNAPDIET_USERINFO", (error, data) => {
        if (error) {
          console.log(error);
          ToastAndroid.show("Error occured.", ToastAndroid.SHORT);
        } else if (data == null) {
          //ToastAndroid.show("Data does not exist",ToastAndroid.SHORT);
        } else {
          data = JSON.parse(data);
          this.props.update("updateInfo", { userInfo: data });
          this.setState({
            userInfo: Object.assign({}, this.state.userInfo, {
              age: data.age.toString(),
              height: data.height.toString(),
              weight: data.weight.toString(),
              gender: data.gender,
              lifeStyles: data.lifeStyles
            })
          });
        }
      });
    };
    getUserInfoOffline();
  }

  imperialSwitch = () => {
    if (this.state.imperial == true)
      this.setState({
        imperial: false,
        hUnits: "cm",
        wUnits: "kg"
      });
    else
      this.setState({
        imperial: true,
        hUnits: "ft",
        wUnits: "lbs"
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.titleText}> Age: </Text>
          <TextInput
            style={styles.inputBox}
            keyboardType="numeric"
            onChangeText={text => {
              this.setState({
                userInfo: Object.assign({}, this.state.userInfo, { age: text })
              });
            }}
            value={this.state.userInfo.age}
          />

          <View style={styles.imperialView}>
            <Text style={styles.titleText}> Imperial Units </Text>
            <Switch
              onValueChange={this.imperialSwitch}
              value={this.state.imperial}
            />
          </View>

          <Text style={styles.titleText}>
            {" "}
            Height (in {this.state.hUnits}):{" "}
          </Text>
          <TextInput
            style={styles.inputBox}
            keyboardType="numeric"
            onChangeText={text => {
              this.setState({
                userInfo: Object.assign({}, this.state.userInfo, {
                  height: text
                })
              });
            }}
            value={this.state.userInfo.height}
          />

          <Text style={styles.titleText}>
            {" "}
            Weight (in {this.state.wUnits}):{" "}
          </Text>
          <TextInput
            style={styles.inputBox}
            keyboardType="numeric"
            onChangeText={text => {
              this.setState({
                userInfo: Object.assign({}, this.state.userInfo, {
                  weight: text
                })
              });
            }}
            value={this.state.userInfo.weight}
          />

          <Text style={styles.titleText}> Gender: </Text>
          <Picker
            selectedValue={this.state.userInfo.gender}
            onValueChange={genderSelected => {
              this.setState({
                userInfo: Object.assign({}, this.state.userInfo, {
                  gender: genderSelected
                })
              });
            }}
          >
            <Picker.Item label="Male" value="M" />
            <Picker.Item label="Female" value="F" />
          </Picker>

          <Text style={styles.titleText}> Lifestyle: </Text>
          <Picker
            selectedValue={this.state.userInfo.lifeStyles}
            onValueChange={lifestyleSelected => {
              this.setState({
                userInfo: Object.assign({}, this.state.userInfo, {
                  lifeStyles: lifestyleSelected
                })
              });
            }}
          >
            <Picker.Item label="Very Lightly Active" value="A" />
            <Picker.Item label="Lightly Active" value="B" />
            <Picker.Item label="Moderately Active" value="C" />
            <Picker.Item label="Very Active" value="D" />
            <Picker.Item label="Extremely Active" value="E" />
          </Picker>

          <TouchableHighlight
            style={styles.button}
            onPress={() => this.handleSubmit()}
            underlayColor="#ff6a6a"
          >
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableHighlight>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    justifyContent: "center",
    padding: 20,
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },

  button: {
    height: 36,
    backgroundColor: "#ff5a5a",
    borderColor: "#ff5a5a",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "stretch",
    justifyContent: "center",
    elevation: 1
  },

  titleText: {
    fontFamily: "openSans",
    fontSize: 19
  },

  buttonText: {
    fontSize: 18,
    fontFamily: "openSans",
    color: "white",
    alignSelf: "center"
  },

  inputBox: {
    height: 40,
    marginTop: 5,
    marginBottom: 10,
    paddingLeft: 5,
    fontSize: 17
  },

  imperialView: {
    flexDirection: "row",
    marginTop: 3,
    marginBottom: 10
  }
});

export default connect(
  store => {
    return store;
  },
  dispatch => {
    return {
      update: (dispatchType, dispatchPayload) => {
        dispatch({ type: dispatchType, payload: dispatchPayload });
      }
    };
  }
)(GetInfo);
