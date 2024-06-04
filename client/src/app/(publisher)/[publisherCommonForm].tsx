import { StyleSheet, Text, TextInput, View, Button, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { defaultStyles } from '@/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import { horizontalScale, verticalScale, moderateScale } from '@/utils/responsiveSize'
import { COLORS, FONT, welcomeCOLOR } from '@/constants/tokens'
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import * as DocumentPicker from 'expo-document-picker';
import { ipURL } from '@/utils/backendURL'

const publisherCommonForm = () => {
    const params = useLocalSearchParams()
    console.log(params, 'params');

    const [title, setTitle] = useState('')
    const [language, setLanguage] = useState('')
    const [categories, setCategories] = useState({});
    const [date, setDate] = useState(new Date(1598051730000));
    const [ISBNDOIISRC, setISBNDOIISRC] = useState('')
    const [synopsis, setSynopsis] = useState('')
    const [narrator, setNarrator] = useState('')
    const [narrationStyleSlow, setNarrationStyleSlow] = useState(false)
    const [narrationStyleFast, setNarrationStyleFast] = useState(false)
    const [narrationStyleIntimate, setNarrationStyleIntimate] = useState(false)
    const [narrationStyleCasual, setNarrationStyleCasual] = useState(false)
    const [narrationStyleStatic, setNarrationStyleStatic] = useState(false)
    const [narrationStyleOratoric, setNarrationStyleOratoric] = useState(false)
    const [audioSample, setAudioSample] = useState({})
    const [doc1, setDoc1] = useState(null);
    const [rightsHolder, setRightsHolder] = useState(false)

    const [isChecked, setChecked] = useState(false);


    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShow(false);
        setDate(currentDate);
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
    };

    const pickAudio = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: "audio/*",
            copyToCacheDirectory: true
        });
    
            let { name, size, uri } = result["assets"][0];
            let nameParts = name.split('.');
            let fileType = nameParts[nameParts.length - 1];
            var fileToUpload = {
                name: name,
                size: size,
                uri: uri,
                type: `audio/${fileType}`
            };
            setAudioSample(fileToUpload);
    };
    

    const postAudio = async () => {
        const url = `${ipURL}/api/s3/upload-to-aws-audio`;
        const formData = new FormData();
        
        formData.append('audio1', {
            uri: audioSample.uri,
            name: audioSample.name,
            type: audioSample.type
        });
        
        const options = {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        
        try {
            console.log(url, 'url', options, 'options');
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            console.log('Success:', responseData);
            
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: "application/pdf",
            copyToCacheDirectory: true
        });

        
            let { name, size, uri } = result["assets"][0];
            let nameParts = name.split('.');
            let fileType = nameParts[nameParts.length - 1];
            var fileToUpload = {
                name: name,
                size: size,
                uri: uri,
                type: "application/" + fileType
            };
            setDoc1(fileToUpload);
    };

    const postDocuments = async () => {
        const url = `${ipURL}/api/s3/upload-to-aws`;
        const formData = new FormData();
        
        if (doc1) formData.append('document1', { uri: doc1.uri, name: doc1.name, type: doc1.type });       
    
        const options = {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        };
    
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            console.log('Success:', responseData);
            
        } catch (error) {
            console.error('Error:', error);
        }
    };

    


    return (
        <SafeAreaView style={defaultStyles.container}>
            <ScrollView>
                <View style={{
                    flex: 1,
                    marginHorizontal: horizontalScale(22),
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                }}>

                    <View style={{ marginVertical: verticalScale(22) }}>
                        <Text style={{
                            fontSize: moderateScale(22),
                            fontWeight: 'bold',
                            marginVertical: verticalScale(12),
                            color: welcomeCOLOR.white
                        }}>
                            Publish as an author
                        </Text>


                    </View>


                    <View >
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black,
                                fontFamily: FONT.RobotoLight

                            }}>Title</Text>

                            <View style={[{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            },]}>
                                <TextInput
                                    placeholder="Enter Title Name"
                                    placeholderTextColor="gray"
                                    autoCapitalize="none"
                                    value={title}
                                    onChangeText={setTitle}
                                    keyboardType='default'
                                    style={{
                                        width: "100%",
                                        color: COLORS.white
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black,
                                fontFamily: FONT.RobotoLight

                            }}>Category</Text>

                            <View style={[{

                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                            },]}>
                                <Picker
                                    mode='dropdown'
                                    dropdownIconColor={COLORS.white}
                                    style={{ backgroundColor: COLORS.background }}
                                    selectedValue={categories}
                                    onValueChange={(itemValue, itemIndex) =>
                                        setCategories(itemValue)
                                    }>
                                    <Picker.Item style={{ color: COLORS.white, backgroundColor: COLORS.background }} label="Biographies & Memoirs" value="biographiesmemoirs" />

                                    <Picker.Item label="Arts & Entertainment" value="artsentertainment" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Business & Finance" value="businessfinance" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Religion & Spirituality" value="religionspirituality" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Health & Wellness" value="healthwellness" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Romance" value="romance" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Comedy" value="comedy" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Science Fiction" value="sciencefiction" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Mystery & Thriller" value="mysterythriller" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Education" value="education" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Science, Technology &  Engineering" value="sciencetechnologyengineering" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Travel & Tourism" value="traveltourism" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="History & Politics" value="historypolitics" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Relationships" value="relationships" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Personal Development" value="personaldevelopment" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Sports & Outdoors" value="sportsoutdoors" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Children" value="children" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Home & Gardening" value="homegardening" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                </Picker>
                            </View>


                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black,
                                fontFamily: FONT.RobotoLight

                            }}>Language</Text>

                            <View style={[{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            },]}>
                                <TextInput
                                    placeholder="Enter Language"
                                    placeholderTextColor="gray"
                                    autoCapitalize="none"
                                    value={language}
                                    onChangeText={setLanguage}
                                    keyboardType='default'
                                    style={{
                                        width: "100%",
                                        color: COLORS.white
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black,
                                fontFamily: FONT.RobotoLight

                            }}>Release Date</Text>

                            <View style={[{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            },]}>
                                <Button color="black" onPress={showDatepicker} title="Show date picker!" />
                                {/* <Text style={defaultStyles.text}>selected: {date.toLocaleString()}</Text> */}
                                {show && (
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={date}
                                        // mode={mode}
                                        is24Hour={true}
                                        onChange={onChange}
                                    />
                                )}
                            </View>
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black,
                                fontFamily: FONT.RobotoLight

                            }}>Enter ISBN/DOI/ISRC No. </Text>

                            <View style={[{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            },]}>
                                <TextInput
                                    placeholder="Enter ISBN/DOI/ISRC No."
                                    placeholderTextColor="gray"
                                    autoCapitalize="none"
                                    value={ISBNDOIISRC}
                                    onChangeText={setISBNDOIISRC}
                                    keyboardType='default'
                                    style={{
                                        width: "100%",
                                        color: COLORS.white
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black,
                                fontFamily: FONT.RobotoLight

                            }}>Enter Synopsis </Text>

                            <View style={[{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            },]}>
                                <TextInput
                                    placeholder="Enter Synopsis"
                                    placeholderTextColor="gray"
                                    autoCapitalize="none"
                                    multiline={true}
                                    numberOfLines={4}
                                    value={synopsis}
                                    onChangeText={setSynopsis}
                                    keyboardType='default'
                                    style={{
                                        width: "100%",
                                        color: COLORS.white
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black,
                                fontFamily: FONT.RobotoLight

                            }}>Narrator Type</Text>

                            <View style={[{

                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                            },]}>
                                <Picker
                                    mode='dropdown'
                                    dropdownIconColor={COLORS.white}
                                    style={{ backgroundColor: COLORS.background }}
                                    selectedValue={narrator}
                                    onValueChange={(itemValue, itemIndex) =>
                                        setNarrator(itemValue)
                                    }>

                                    <Picker.Item label="Male" value="M" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Female" value="F" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />

                                    <Picker.Item label="Hybrid" value="H" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                </Picker>
                            </View>




                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black,
                                fontFamily: FONT.RobotoLight

                            }}>Narration style</Text>

                            <View style={[{
                                flexDirection: "row",

                            },]}>

                                <Checkbox
                                    value={narrationStyleSlow}
                                    onValueChange={setNarrationStyleSlow}
                                    color={isChecked ? '#4630EB' : undefined}
                                />
                                <Text style={defaultStyles.text}>Slow</Text>

                                <Checkbox
                                    value={narrationStyleFast}
                                    onValueChange={setNarrationStyleFast}
                                    color={isChecked ? '#4630EB' : undefined}
                                />
                                <Text style={defaultStyles.text}>Fast</Text>
                                </View>
                                <View style={[{
                                flexDirection: "row",

                            },]}>
                                <Checkbox
                                    value={narrationStyleIntimate}
                                    onValueChange={setNarrationStyleIntimate}
                                    color={isChecked ? '#4630EB' : undefined}
                                />
                                <Text style={defaultStyles.text}>Intimate</Text>
                                <Checkbox
                                    value={narrationStyleCasual}
                                    onValueChange={setNarrationStyleCasual}
                                    color={isChecked ? '#4630EB' : undefined}
                                />
                                <Text style={defaultStyles.text}>Casual</Text>
                                </View>

                                <View style={[{
                                flexDirection: "row",

                            },]}>
                                <Checkbox
                                    value={narrationStyleOratoric}
                                    onValueChange={setNarrationStyleOratoric}
                                    color={isChecked ? '#4630EB' : undefined}
                                />
                                <Text style={defaultStyles.text}>Oratoric</Text>
                                <Checkbox
                                    value={narrationStyleStatic}
                                    onValueChange={setNarrationStyleStatic}
                                    color={isChecked ? '#4630EB' : undefined}
                                />
                                <Text style={defaultStyles.text}>Static</Text>
                                </View>
                            
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                        <Text style={{
                            fontSize: moderateScale(16),
                            fontWeight: "200",
                            marginVertical: verticalScale(8),
                            color: welcomeCOLOR.black,
                            fontFamily: FONT.RobotoLight

                        }}>Upload Sample</Text>

                       
                        <TouchableOpacity onPress={pickAudio} >
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: COLORS.white,
                                fontFamily: FONT.RobotoLight

                            }}>Upload Audio Sample</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={postAudio} ><Text style={defaultStyles.mainText}>Upload Audio to backend</Text></TouchableOpacity>

                        <TouchableOpacity onPress={pickDocument} >
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: COLORS.white,
                                fontFamily: FONT.RobotoLight

                            }}>Upload Pdf </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={postDocuments} ><Text style={defaultStyles.mainText}>Upload Pdf to backend</Text></TouchableOpacity>
                        
                    </View>

                    <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black,
                                fontFamily: FONT.RobotoLight

                            }}>Narration style</Text>

                            <View style={[{
                                flexDirection: "row",

                            },]}>

                                <Checkbox
                                    value={rightsHolder}
                                    onValueChange={setRightsHolder}
                                    color={isChecked ? '#4630EB' : undefined}
                                />
                                <Text style={defaultStyles.text}>Are you a rights holder?</Text>

                                </View>
                            
                        </View>

                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default publisherCommonForm

const styles = StyleSheet.create({})