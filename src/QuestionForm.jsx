import React, {useState} from 'react';

export default function QuestionForm(){

    const [value, setValue] = useState('');

    const handleSubmit=(e)=>{
        e.preventDefault()
//on submit,
    //have the question(the current value here) render w/ a button of form to add options
//on add of option -> have them render to screen
        //when option is added (have question hold the meta array key w/ this option)
//once an option is added, have the value hold a meta array with the option as a key 

    }

    const handleChange=(e)=>{
        setValue(e.target.value)
    }
    return(
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="question">Question</label>
                <br></br>
                <input type="text" id="question" name="question" value={value} onChange={handleChange}/>
                <br></br>
                <input type="submit" value="Submit" />
            </form>
        </div>
    )
}