import React, { Component } from 'react'

export default class Actions extends Component {
    constructor(props){
        super(props)
        this.state = {rows: ['']}
    }

    createAction = () => {


        
    }
    render() {
        return (
            <div class="card border-primary mb-3">
                <div class="card-header">Action Builder</div>
                    <div class="card-body">
                        <table>
                            <tbody>
                                {this.state.rows.map(action =>(
                                    <tr key={action}>
                                        <td><form><input type="text" className="form-control-actions form-control" placeholder="Action"></input></form></td>
                                        <td><form><input type="text" className="form-control-actions form-control" placeholder="Object"></input></form></td>
                                        <td><form><input type="text" className="form-control-actions form-control" placeholder="ID"></input></form></td>
                                        <td><form><input type="text" className="form-control-actions form-control" placeholder="Object"></input></form></td>
                                        <td><form><input type="text" className="form-control-actions form-control" placeholder="ID"></input></form></td>
                                        <td><form><input type="text" className="form-control-actions form-control" placeholder="Object"></input></form></td>
                                        <td><form><input type="text" className="form-control-actions form-control" placeholder="ID"></input></form></td>
                                        <td><form><input type="text" className="form-control-actions form-control" placeholder="Quant"></input></form></td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-sm btn-primary">Add Row</button>
                        <button type="button" className="btn btn-sm btn-primary">Save changes</button>
                    </div>
                </div>
            </div>                       
        )
    }
}
