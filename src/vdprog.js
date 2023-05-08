import {v_node,txt_node,diff,patch} from "./vdom.js"

//=============================================================================
// vscript, does all the "defensive" junk and lets you have nice interface for making nodes
//

const parse_tag = (tag) => {
  if(typeof tag !== "string") {
    throw new Error("tag should be a string")
  };

  //this will probably need to be fancier, but for now we will do this
  const [head,id] = tag.split("#");
  const [node_tag,...classes]  = head.split(".");

  return { 
    node_tag,
    id,
    "css_class":classes.join(" ")
  }
}

const format_style = (style) => {
  if(typeof style !== "object") {
    return style;
  }

  return Object.entries(style).map((pair) => pair.join(":")).join(";");
}

const format_props = (id,css_class,other_props) => {
  if(!(typeof other_props === "object" && other_props !== null)) {
    throw new Error("properties should be an object i.e this guy: {}");
  }

  const {hooks =[], attributes ={}, style, ...remaining_props} = other_props;

  if(id !== undefined) {
    attributes.id = id;
  }

  if(css_class !== undefined) {
    attributes["class"] = css_class;
  }

  const formatted_style =format_style(style); 

  if(style) {
    attributes["style"] = formatted_style;
  }

  return {
    "final_props":{attributes,...remaining_props},
    hooks
  }
}

const format_children = (children) => {
  const all_kids = Array.isArray(children) ? children : [children];

  return all_kids.map( k => {
    if(typeof k === "string") {
      return txt_node(k);
    }

    return k;
  });
}

export const h = (tag,props = {},children = []) => {
  
  const {node_tag,css_class,id} = parse_tag(tag);
  const {final_props,hooks} = format_props(id,css_class,props);
  const final_children = format_children(children);

  return v_node(node_tag,final_props,final_children,hooks);
}

//=============================================================================
//the "program" which creates an observable state and runs a reactive loop


export const vdom_loop = (root_element,state,update_table,render) => {

  let vd = undefined;
  let root = root_element;


  const wrap_updates = (t) => {
    return Object.entries(t).reduce( (wrapped,[k,v]) => {
      if(typeof v === "function" && v.constructor.name === "AsyncFunction") {
        wrapped[k] = async (...args) => {
          await v(...args);
          re_render();
        }
      }
      else if(typeof v === "function") {
          wrapped[k] = (...args) => {
          v(...args);
          re_render();
        }
      }
      else if(typeof v === "object" && v !== null) {
        wrapped[k] = wrap_updates(v);
      }

      return wrapped;
    },{});
  }

  const updates = wrap_updates(update_table);

  const re_render = () => {
    const new_vd = render(state,updates);
    const patches = diff(vd,new_vd);
    root = patch(root,patches);
    vd = new_vd;
  }

  return {"start":re_render};
}
