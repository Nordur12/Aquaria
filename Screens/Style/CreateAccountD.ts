import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFF',
    },
    Mcon: {
      width: 120,
      height: 120,
      borderRadius: 10,
      position: 'relative',
      top: -25,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 30,
      color: '#000000',
      top: -25,
    },
    formContainer: {
      bottom: 33,
      width: '80%',
      paddingHorizontal: 30,
    },
    input: {
      height: 40,
      borderWidth: 1,
      borderRadius: 2,
      marginBottom: 18,
      paddingHorizontal: 10,
      backgroundColor: '#FFF',
      borderBottomWidth: 4,
      borderTopWidth: 0,
      borderRightWidth: 0,
      borderLeftWidth: 0,
      color: '#000',
    },
    createAccountButton: {
      width: '68%',
      height: 40,
      backgroundColor: '#8497b3',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      bottom: 20,
    },
    buttonText: {
      color: '#000000',
      fontSize: 15,
      fontWeight: 'bold',
    },
    showPasswordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
    },
    showPasswordText: {
      color: '#696666',
      fontSize: 16,
      marginRight: 10,
    },
    alreadyHaveAccountContainer: {
      flexDirection: 'row',
      marginTop: 10,
      bottom: 15,
    },
    alreadyHaveAccountText: {
      fontSize: 14,
      color: '#000',
    },
    loginText: {
      color: '#007BFF',
      fontSize: 14,
      marginLeft: 5,
      textDecorationLine: 'underline',
    },
    googleButton: {
      backgroundColor: '#4285F4',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginVertical: 10,
    },
    googleButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },

  });
  
  export default styles;