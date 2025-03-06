import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 20,
    },
    Mcon: {
        width: 120,
        height: 120,
        borderRadius: 10,
        position: 'relative',
        bottom: 90,
      },
      formContainer: {
        alignItems: 'center',
      },
      title: {
        fontSize: 24,
        bottom: 80,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'black',
      },
      instructions: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#3b3b3b',
        bottom: 75,
      },
      input: {
        width: '100%',
        padding: 5,
        paddingHorizontal: 80,
        borderBottomWidth: 3,
        borderColor: '#3b3b3b',
        borderRadius: 5,
        marginBottom: 20,
        top: -50,
        color: 'black',
      },
      button: {
        backgroundColor: '#8497b3',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        width: '100%',
        alignItems: 'center',
        top: -40,
      },
      buttonText: {
        color: '#000000',
        fontSize: 16,
      },
      backToLoginText: {
        marginTop: 20,
        fontSize: 14,
        color: '#0000FF',
        textDecorationLine: 'underline',
      },
    });
  export default styles;