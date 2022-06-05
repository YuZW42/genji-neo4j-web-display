import React from 'react'
import { initDriver, getDriver, closeDriver } from '../neo4j'
import { toNativeTypes } from '../utils'

export default class Poem extends React.Component { 

    constructor(props) {
        super(props)
        initDriver(this.props.uri, this.props.user, this.props.password)
        this.driver = getDriver()
        this.state = {
            Japanese: [],
            Translation: {}
        }
        this.parsePnum = this.parsePnum.bind(this)
    }

    parsePnum(pnum) {
        let [chp, _, order] = pnum.match(/.{1,2}/g)
        let chp_name
        switch(chp){
            case '01':
                chp_name = "Kiritsubo 桐壺"
                break
            case '02':
                chp_name = "Hahakigi 帚木"
                break
            case '03': 
                chp_name = "Utsusemi 空蝉"
                break
            case '04': 
                chp_name = "Yūgao 夕顔"
                break
            case '05': 
                chp_name = "Wakamurasaki 若紫"
                break
            case '06': 
                chp_name = "Suetsumuhana 末摘花"
                break
            case '07': 
                chp_name = "Momiji no Ga 紅葉賀"
                break
            case '08': 
                chp_name = "Hana no En 花宴"
                break
            case '09': 
                chp_name = "Aoi 葵"
                break
            case '10': 
                chp_name = "Sakaki 榊"
                break
            case '11': 
                chp_name = "Hana Chiru Sato 花散里"
                break
            case '12': 
                chp_name = "Suma 須磨"
                break
            case '13': 
                chp_name = "Akashi 明石"
                break
            case '14': 
                chp_name = "Miotsukushi 澪標"
                break
            case '15': 
                chp_name = "Yomogiu 蓬生"
                break
            case '16': 
                chp_name = "Sekiya 関屋"
                break
            case '17': 
                chp_name = "E Awase 絵合"
                break
            case '18': 
                chp_name = "Matsukaze 松風"
                break
            case '19': 
                chp_name = "Usugumo 薄雲"
                break
            case '20': 
                chp_name = "Asagao 朝顔"
                break
            case '21': 
                chp_name = "Otome 乙女"
                break
            case '22': 
                chp_name = "Tamakazura 玉鬘"
                break
            case '23': 
                chp_name = "Hatsune 初音"
                break
            case '24': 
                chp_name = "Kochō 胡蝶"
                break
            case '25': 
                chp_name = "Hotaru 螢"
                break
            case '26': 
                chp_name = "Tokonatsu 常夏"
                break
            case '27': 
                chp_name = "Kagaribi 篝火"
                break
            case '28': 
                chp_name = "Nowaki 野分"
                break
            case '29': 
                chp_name = "Miyuki 行幸"
                break
            case '30': 
                chp_name = "Fujibakama 藤袴"
                break
            case '31': 
                chp_name = "Makibashira 真木柱"
                break
            case '32': 
                chp_name = "Umegae 梅枝"
                break
            case '33': 
                chp_name = "Fuji no Uraba 藤裏葉"
                break
            case '34': 
                chp_name = "Wakana: Jō 若菜上"
                break
            case '35': 
                chp_name = "Wakana: Ge 若菜下"
                break
            case '36': 
                chp_name = "Kashiwagi 柏木"
                break
            case '37': 
                chp_name = "Yokobue 横笛"
                break
            case '38': 
                chp_name = "Suzumushi 鈴虫"
                break
            case '39':
                chp_name = "Yūgiri 夕霧"
                break
            case '40': 
                chp_name = "Minori 御法"
                break
            case '41': 
                chp_name = "Maboroshi 幻"
                break
            case '42': 
                chp_name = "Niō Miya 匂宮"
                break
            case '43': 
                chp_name = "Kōbai 紅梅"
                break
            case '44': 
                chp_name = "Takekawa 竹河"
                break
            case '45': 
                chp_name = "Hashihime 橋姫"
                break
            case '46': 
                chp_name = "Shii ga Moto 椎本"
                break
            case '47': 
                chp_name = "Agemaki 総角"
                break
            case '48': 
                chp_name = "Sawarabi 早蕨"
                break
            case '49': 
                chp_name = "Yadorigi 宿木"
                break
            case '50': 
                chp_name = "Azumaya 東屋"
                break
            case '51':
                chp_name = "Ukifune 浮舟"
                break
            case '52':
                chp_name = "Kagerō 蜻蛉"
                break
            case '53':
                chp_name = "Tenarai 手習"
                break
            case '54':
                chp_name = "Yume no Ukihashi 夢浮橋"
                break
            default: 
                console.log('unknown chapter caught')
        }
        order = parseInt(order)
        return (
            <p>{chp} {chp_name} {order}</p>
        )
    }

    async componentDidMount() {
        const session = this.driver.session()
        const chapter = this.props.chapter
        const speaker = this.props.speaker
        const addressee = this.props.addressee
        
        try {
            let getSpeaker, getAddressee, getChapter
            if (speaker === 'Any') {
                getSpeaker = '(s:Character)'
            } else {
                getSpeaker = '(s:Character {name: "'+speaker+'"})'
            } 
            if (addressee === 'Any') {
                getAddressee = '(a:Character)'
            } else {
                getAddressee = '(a:Character {name: "'+addressee+'"})'
            }
            if (chapter === 'Any') {
                getChapter = ', (g)-[r:INCLUDED_IN]-(c:Chapter), '
            } else {
                //as of Apirl 2022, the chapter numbers are in string
                getChapter = ', (g)-[r:INCLUDED_IN]-(c:Chapter {chapter_number: "'+chapter+'"}), '
            }
            let get =   'match exchange='+getSpeaker+'-[p:SPEAKER_OF]-(g:Genji_Poem)-'
                            +'[q:ADDRESSEE_OF]-'+getAddressee 
                            +getChapter
                            +'trans=(g)-[u:TRANSLATION_OF]-(t:Translation)'
                            +' return exchange, trans'
            const res = await session.readTransaction(tx => tx.run(get, { speaker, addressee, chapter}))
            // console.log(get)
            let poemRes = res.records.map(row => {return toNativeTypes(row.get('exchange'))})
            let transRes = res.records.map(row => {return toNativeTypes(row.get('trans'))})
            let Japanese = poemRes.map(row => row.segments[1].start.properties)
            let transTemp = transRes.map(row => Object.values(row.end.properties))
            let speakers = poemRes.map(row => row.segments[0].start.properties.name)
            let addressees = poemRes.map(row => row.segments[1].end.properties.name)
            let Translation = {}
            let plist = new Set()
            for (let i = 0; i < Japanese.length; i++) {
                plist.add(JSON.stringify([Japanese[i].pnum, Japanese[i].Japanese, Japanese[i].Romaji, speakers[i], addressees[i]]))
            }
            plist = Array.from(plist).map(item => JSON.parse(item))
            // sorting the list of poems
            for (let i = 0; i < plist.length-1; i++) {
                for (let j = 0; j < plist.length-i-1; j++) {
                    if ((parseInt(plist[j][0].substring(0, 2)) > parseInt(plist[j+1][0].substring(0, 2))) 
                    || (parseInt(plist[j][0].substring(0, 2)) >= parseInt(plist[j+1][0].substring(0, 2)) 
                    && parseInt(plist[j][0].substring(4, 6)) > parseInt(plist[j+1][0].substring(4, 6)))) {
                        let poemRes = plist[j+1]
                        plist[j+1] = plist[j]
                        plist[j] = poemRes
                    }
                }
            }
            // prepare the list of translations
            transTemp.forEach(element => {
                if (element.length !== 1) {
                    let count
                    if (element.length === 2) {
                        count = 0
                    } else {
                        count = 1
                    }
                    let pnum_count = count
                    if (Translation[element[count+1].substring(0,6)] === undefined) {
                        Translation[element[count+1].substring(0,6)] = {}
                    }
                    let auth = element[count+1].substring(6,7)
                    if (auth === 'A') {
                        auth = 'Waley'
                        // special case handler: Waley trans with a page number
                        if (element.length === 3) {
                            pnum_count -= 1
                        }
                    } else if (auth === 'C') {
                        auth = 'Cranston'
                    } else if (auth === 'S') {
                        auth = 'Seidensticker'
                    } else if (auth === 'T') {
                        auth = 'Tyler'
                    } else {
                        auth = 'Washburn'
                    }
                    // console.log(element[count+1].substring(0,6))
                    Translation[element[count+1].substring(0,6)][auth] = element[pnum_count]
                }
            });
            this.setState({
                Japanese: plist,
                Translation: Translation,
            }, 
            () => {
                console.log('Japanese set')
            })
        } catch (e) {
            console.log('Error in poem: '+e)
        } finally {
            await session.close()
        }
        closeDriver()
    }

    // getDerived

    render() {
        let plist = this.state.Japanese;
        let trans = this.state.Translation
        let updateSelection = (event) => {
            let target = event.target.parentElement.querySelector('p')
            let pnum = target.className
            let auth = event.target.value
            target.innerHTML = trans[pnum][auth]
        }
        function getOptions(pnum) {
            // console.log(pnum)
            let options = Object.keys(trans[pnum]).sort();
            return (options)
        }
        return (
            <table>
                <thead>
                    <tr>
                        <th>Chapter Name</th>
                        <th>Speaker</th>
                        <th>Addressee</th>
                        <th>Japanese</th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {plist.map((row) => <tr key={row[0]}>
                                                <td>{this.parsePnum(row[0])}</td>
                                                <td>{row[3]}</td>
                                                <td>{row[4]}</td>
                                                <td>{row[1]}</td>
                                                <td>
                                                    <select onChange={updateSelection}>
                                                        <option>select:</option>
                                                        {getOptions(row[0]).map((item) => <option key={trans[row[0]][item]}>{item}</option>)}
                                                    </select>
                                                    <p className={row[0]}></p>
                                                </td>
                                                <td>
                                                    <select onChange={updateSelection}>
                                                        <option>select:</option>
                                                        {getOptions(row[0]).map((item) => <option key={trans[row[0]][item]}>{item}</option>)}
                                                    </select>
                                                    <p className={row[0]}></p>
                                                </td>
                                                <td>
                                                    <select onChange={updateSelection}>
                                                        <option>select:</option>
                                                        {getOptions(row[0]).map((item) => <option key={trans[row[0]][item]}>{item}</option>)}
                                                    </select>
                                                    <p className={row[0]}></p>
                                                </td>
                                            </tr>)}
                </tbody>
            </table>
        )
    }
}