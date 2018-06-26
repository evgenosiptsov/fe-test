import { Children } from 'react';
import { Control, DomUtil, DomEvent } from 'leaflet';
import { MapControl } from 'react-leaflet';
import PropTypes from 'prop-types';
import { Map } from 'leaflet';
import { render, unmountComponentAtNode } from 'react-dom';

const leafletControl = Control.extend({
	options: {
		className: '',
		onOff: '',
		handleOff: function noop(){}
	},
	
	onAdd: function (map) {
		var _controlDiv = DomUtil.create('div', this.options.className);
		DomEvent.disableClickPropagation(_controlDiv);
		return _controlDiv;
	},
	
	onRemove: function (map) {
		if (this.options.onOff) {
			map.off(this.options.onOff, this.options.handleOff, this);
		}
		return this;
	}
});

export default class SimpleControl extends MapControl {
	static contextTypes = MapControl.contextTypes;
	static childContextTypes = MapControl.childContextTypes;
	static propTypes = {
		children: PropTypes.node,
		map: PropTypes.instanceOf(Map),
		popupContainer: PropTypes.object,
		position: PropTypes.string
	};
	
	componentWillMount() {
		const { children: _children, map: _map, popupContainer, ...props } = this.props;
		
		this.leafletElement = new leafletControl(props);
	}
	
	componentDidMount(){
		super.componentDidMount();
		this.renderContent();
	}
	
	componentDidUpdate(next) {
		super.componentDidUpdate(next);
		this.renderContent();
	}
	
	componentWillUnmount() {
		unmountComponentAtNode(this.leafletElement.getContainer());
	}
	
	renderContent() {
		const container = this.leafletElement.getContainer();
		render(
			Children.only(this.props.children),
			container
		);
	}
	
	render() {
		return null;
	}
	
}