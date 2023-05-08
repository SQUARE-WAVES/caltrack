const VNODE = Symbol('vn');
const TXT = Symbol('t');

//=============================================================================
// create node
export const v_node = (tag,props={},children =[], hooks=[]) => ({tag,props,children,hooks,'type':VNODE});

export const txt_node = (str) => ({str, 'type':TXT});

//=============================================================================
//RENDER
const renders = {
  [VNODE] : ({tag, props, children, hooks}) => {
    const node = document.createElement(tag);

    Object.entries(props).forEach( ([k,v]) => {
      if(k === "attributes") {
        Object.entries(v).forEach (([k,v]) => node.setAttribute(k,v));
      }
      else {
        node[k] = v;
      }
    });
    
    children.forEach( child => {
      const kid = render(child);
      node.appendChild(kid)
    });

    hooks.forEach(h => h(node)); 

    return node;
  },

  [TXT] : ({str}) => document.createTextNode(str)
}

const render = (vn) => {
  const renderer = renders[vn.type];
  
  if(renderer === undefined) {
    throw new Error("node is unrenderable");
  }

  return renderer(vn);
}


//=============================================================================
//PATCH

const REMOVE_NODE = Symbol("patch_remove_node");
const REPLACE_NODE = Symbol("patch_replace_node");
const SET_PROPERTY = Symbol("patch_set_property");
const REMOVE_ATTRIBUTE = Symbol("patch_remove_attribute");
const SET_ATTRIBUTE = Symbol("patch_set_attribute");
const ADD_CHILD = Symbol("patch_add_child");
const PATCH_CHILD = Symbol("patch_child");
const HOOK = Symbol("execute_hook");

const patch_handlers = {
  [REMOVE_NODE] : (node) => node.remove(),

  [REPLACE_NODE] : (node,{vnode}) => {
    const new_node = render(vnode);
    node.replaceWith(new_node);
    return new_node;
  },
  
  [SET_PROPERTY] : (node,{k,v}) => {
    const pre = k.slice(0,k.length-1);
    const tail = k.slice(-1)[0];
    
    const props_obj = pre.reduce((a,key) => a[key], node);
    props_obj[tail] = v;
    return node;
  },
  
  [REMOVE_ATTRIBUTE] : (node,{k}) => {
    node.removeAttribute(k);
    return node;
  },

  [SET_ATTRIBUTE] : (node,{k,v}) => {
    node.setAttribute(k,v);
    return node;
  },

  [PATCH_CHILD]: (node,{index,patches}) => {
    const child = patches.reduce((n,p) => apply_patch(n,p),node.childNodes[index]);
    return node;
  },

  [ADD_CHILD]: (node,{vnode}) => {
    node.appendChild(render(vnode));
    return node;
  },

  [HOOK] : (node,{hook}) => {
    hook(node);
    return node;
  }
}

const patch_printers = {
  [REMOVE_NODE] : () => `remove node`,

  [REPLACE_NODE] : ({vnode}) => `replace node : ${vnode}`,
  
  [SET_PROPERTY] : ({k,v}) => `set property ${k} : ${v}`,
  [REMOVE_ATTRIBUTE] : ({k}) => `remove attribute ${k}`,
  [SET_ATTRIBUTE] : ({k,v}) => `set attriubte: ${k} : ${v}`,
  [PATCH_CHILD]: ({index,patches}) => `patch child: ${index} \n ${patches.map(print_patch).join("\n   ")}`,
  [ADD_CHILD]: ({vnode}) => `appedn child: ${vnode}`,
  [HOOK] : ({hook}) => `add hook`
}

export const print_patch = (p) => {
  const printer = patch_printers[p.type];
  if(printer === undefined) {
    return`unknown type: ${p.type}`
  }
  else {
    return printer(p)
  }
}

const apply_patch = (node,patch) => {
  const handler = patch_handlers[patch.type];
  return handler(node,patch);
}

const remove = () => ({"type":REMOVE_NODE});
const replace = (vnode) => ({"type":REPLACE_NODE,vnode});
const set_attr = (k,v) => ({"type":SET_ATTRIBUTE,k,v});
const remove_attr = (k) => ({"type":REMOVE_ATTRIBUTE,k});
const set_prop = (k,v) => ({"type":SET_PROPERTY,k,v});
const add_child = (vnode) => ({"type":ADD_CHILD,vnode});
const patch_child = (index,patches) => ({"type":PATCH_CHILD,index,patches});
const hook_patch = (hook) => ({"type":HOOK,hook});

//=============================================================================
//DIFF
const diff_attrs = (old_attrs = {},new_attrs = {}) => {
  const news = Object.entries(new_attrs).filter( ([k,v]) => old_attrs[k] !== v ).map( ([k,v]) => set_attr(k,v));

  const removals = Object.keys(old_attrs)
    .filter(k => !(k in new_attrs))
    .map(k => remove_attr(k));


  return [...removals,...news];
}

//for now this only does one level deep
const diff_obj_props = (prop_key,old_obj={},new_obj) => {
  if(new_obj === null) {
    return set_prop([prop_key],undefined);
  }
  
  if(old_obj === null) {
    return set_prop([prop_key],new_obj); //may have to clone?
  }

  const remove_keys = Object.keys(old_obj).filter(k => !k in new_obj);
  const removes = remove_keys.map(k => set_prop([prop_key,k],undefined));

  const adds = Object.entries(new_obj).map(([k,v]) => set_prop([prop_key,k],v));

  return [...removes,...adds];
}

//props should always exists, but the defaults are there in case
const diff_props = (old_props = {},new_props = {}) => {
  //special case of attributes
  const old_attrs = old_props.attributes;
  const new_attrs = new_props.attributes;
  const attr_patch = diff_attrs(old_attrs,new_attrs);

  const old_keys = Object.keys(old_props).filter(k => k !== "attributes" && !(k in new_props));
  const new_entries = Object.entries(new_props).filter(([k,v]) => k !== "attributes");

  const removes = old_keys.map(k => set_prop([k],undefined));
  
  const adds = new_entries.reduce((a,[k,v]) => {

    if(typeof v === "object" && v !== null) {
      const old_v = old_props[k];
      return [...a,...diff_obj_props(k,old_v,v)];
    }

    return [...a,set_prop([k],v)];
  },[]);

  return [...attr_patch,...removes,...adds];
}

const diff_children = (old_children,new_children) => {
  
  const updates = old_children.map( (child,i) => patch_child(i,diff(child,new_children[i])));
  const adds = new_children.slice(old_children.length).map( nc => add_child(nc));

  //you need the child updates to be reversed because if nodes are removed they will
  //screw up the indicies for other ones, so you need to take them off the back first.
  return [...updates.reverse(),...adds];
}

export const diff = (old_vn,new_vn) => {
  if(new_vn === undefined) {
    return [remove()];
  }

  if(old_vn === undefined || old_vn.type === TXT || new_vn.type === TXT || old_vn.tag !== new_vn.tag) {
    return [replace(new_vn)];
  }

  const props_patch = diff_props(old_vn.props,new_vn.props);
  const child_patch = diff_children(old_vn.children,new_vn.children);
  const hooks = new_vn.hooks.map(h => hook_patch(h));

  return [...props_patch,...hooks,...child_patch];
}

export const patch = (root,patches) => patches.reduce((n,p) => apply_patch(root,p),root);
