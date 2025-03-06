import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white', 
  },
  
  Mcon: {
    width: 120,
    height: 120,
    borderRadius: 10,
    position: 'relative',
    top: 30,
  },
  text: {
    fontSize: 18,
    top: 20,
    fontWeight: 'bold',
    color: '#000000', 
    fontFamily: 'Rubik',
  },
  formContainer: {
    marginTop: 100,
    width: '80%',
    paddingHorizontal: 30,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 2,
    marginBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 4,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    color: '#000',

  },
  forgetPasswordText: {
    color: '#0000FF', 
    fontSize: 14,
    marginTop: -5,
    marginBottom: 35,
    left: 8,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#8497b3',
    paddingVertical: 10,
    borderRadius: 51,
    alignItems: 'center',
    bottom: 10,
    marginBottom: -8,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 15,
  },
  accountText: {
    fontSize: 14,
    color: '#000',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  createAccountText: {
    color: '#0000FF',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    top: -5,
    marginLeft: -25,
    backgroundColor: 'white',
  },
  
});

  export default styles;