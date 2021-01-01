import React, { Component } from "react";

const rowTemplate = {
    verb: null,
    noun1: null,
    adj1: null,
    noun2: null,
    adj2: null,
    noun3: null,
    adj3: null,
    adverb: null,
  };

export default class Actions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commands: this.props.commands,
      selected: this.props.selected,
      rows: {0:rowTemplate},
    };
  }

//   handleAddRow = () => {
    
//     const newID = Math.max({ ...this.state.rows }.keys()) + 1;
//     this.setState({ rows: { ...this.state.rows }, [newID]: rowTemplate });
//   };

//   handleDeleteRow = (rowID) => {
//     let deleteRow;
//     const newRows = [...this.state.rows];
//     newRows.forEach((action) => {
//       if (action.id === rowID) {
//         deleteRow = newRows.indexOf(action);
//       }
//     });
//     newRows.splice(deleteRow, 1);
//     this.setState({ rows: newRows });
//   };

  // onChange = (event, id) => {
  //   console.log(this.state.rows);
  //   const newRows = this.state.rows;
  //   newRows.forEach((row) => {
  //     if (row.id === id) {
  //       row[event.target.name] = event.target.value;
  //       newRows[newRows.indexOf(row)] = row;
  //     }
  //   });
  //   this.setState({ rows: newRows });
  // };

//   //   shouldComponentUpdate() {
//   //       console.log(this.props.commands)
//   //     if (this.props.commands !== this.state.commands) {
//   //       this.setState({ commands: this.props.commands });
//   //     }
//   //     if (this.props.selected !== this.state.selected) {
//   //       this.setState({ selected: this.props.selected });

//   //       this.setState({ rows: [""] });
//   //     }
//   //     return true;
//   //   }

  render() {
    return null
      // <div className="card border-primary mb-3">
      //   <div className="card-header">Actions</div>
      //   <div className="card-body">
      //     <table>
      //       <tbody>
      //         {Object.keys(this.state.rows).map((id) => (
      //           <tr className="table table-sm" key={id}>
      //             <td>
      //               <input
      //                 type="text"
      //                 name="verb"
      //                 className="form-control"
      //                 placeholder="Action"
      //                 onChange={(event) => this.onChange(event, id)}
      //               ></input>
      //             </td>
      //             <td>
      //               <input
      //                 type="text"
      //                 name="noun1"
      //                 className="form-control"
      //                 placeholder="Object"
      //                 onChange={(event) => this.onChange(event, id)}
      //               ></input>
      //             </td>
      //             <td>
      //               <input
      //                 type="text"
      //                 name="adj1"
      //                 className="form-control"
      //                 placeholder="ID"
      //                 onChange={(event) => this.onChange(event, id)}
      //               ></input>
      //             </td>
      //             <td>
      //               <input
      //                 type="text"
      //                 name="noun2"
      //                 className="form-control"
      //                 placeholder="Object"
      //                 onChange={(event) => this.onChange(event, id)}
      //               ></input>
      //             </td>
      //             <td>
      //               <input
      //                 type="text"
      //                 name="adj2"
      //                 className="form-control"
      //                 placeholder="ID"
      //                 onChange={(event) => this.onChange(event, id)}
      //               ></input>
      //             </td>
      //             <td>
      //               <input
      //                 type="text"
      //                 name="noun3"
      //                 className="form-control"
      //                 placeholder="Object"
      //                 onChange={(event) => this.onChange(event, id)}
      //               ></input>
      //             </td>
      //             <td>
      //               <input
      //                 type="text"
      //                 name="adj3"
      //                 className="form-control"
      //                 placeholder="ID"
      //                 onChange={(event) => this.onChange(event, id)}
      //               ></input>
      //             </td>
      //             <td>
      //               <input
      //                 type="text"
      //                 name="adverb"
      //                 className="form-control"
      //                 placeholder="Quant"
      //                 onChange={(event) => this.onChange(event, id)}
      //               ></input>
      //             </td>

      //             <td style={{ width: "5%" }}>
      //               {this.state.rows.length !== 1 && (
      //                 <button
      //                   className="btn btn-sm btn-outline-danger"
      //                   onClick={() => {
      //                     this.handleDeleteRow(id);
      //                   }}
      //                 >
      //                   Remove
      //                 </button>
      //               )}
      //             </td>

      //             <td style={{ width: "5%" }}>
      //               {this.state.rows.length - 1 ===
      //                 this.state.rows[id] && (
      //                 <button
      //                   className="btn btn-sm btn-outline-success"
      //                   onClick={() => {
      //                     this.handleAddRow();
      //                   }}
      //                 >
      //                   Add
      //                 </button>
      //               )}
      //             </td>
      //           </tr>
      //         ))}
      //       </tbody>
      //     </table>
      //   </div>
      // </div>
    
  }
}









<table>
            <tbody>
              {this.state.actions.map((action, index) => (
                <tr className="table table-sm" key={index}>
                  
                  <td>
                    <input
                      type="text"
                      value={action.verb}
                      name="verb"
                      className="form-control"
                      placeholder = "Action"
                      onChange={(event) => this.onChange(event, index)}
                    ></input>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={action.noun1}
                      name="noun1"
                      className="form-control"
                      placeholder="Object"
                      onChange={(event) => this.onChange(event, index)}
                    ></input>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={action.adj1}
                      name="adj1"
                      className="form-control"
                      placeholder="ID"
                      onChange={(event) => this.onChange(event, index)}
                    ></input>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={action.noun2}
                      name="noun2"
                      className="form-control"
                      placeholder="Object"
                      onChange={(event) => this.onChange(event, index)}
                    ></input>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={action.adj2}
                      name="adj2"
                      className="form-control"
                      placeholder="ID"
                      onChange={(event) => this.onChange(event, index)}
                    ></input>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={action.noun3}
                      name="noun3"
                      className="form-control"
                      placeholder="Object"
                      onChange={(event) => this.onChange(event, index)}
                    ></input>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={action.adj3}
                      name="adj3"
                      className="form-control"
                      placeholder="ID"
                      onChange={(event) => this.onChange(event, index)}
                    ></input>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={action.adverb}
                      name="adverb"
                      className="form-control"
                      placeholder="Quant"
                      onChange={(event) => this.onChange(event, index)}
                    ></input>
                  </td>

                  <td style={{ width: "5%" }}>
                    {this.state.actions.length !== 1 && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          this.handleDeleteAction(index);
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </td>

                  <td style={{ width: "5%" }}>
                    {this.state.actions.length - 1 === index && (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => {
                          this.handleAddAction();
                        }}
                      >
                        Add
                      </button>
                    )}
                  </td>
                </tr>
                
                
              ))}
              

              
            </tbody>
          </table>