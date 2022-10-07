/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	__experimentalListView as ListView,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Button, __experimentalText as Text } from '@wordpress/components';
import {
	useFocusOnMount,
	useFocusReturn,
	useMergeRefs,
} from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { ESCAPE } from '@wordpress/keycodes';
import { useState, useEffect } from '@wordpress/element';
import {
	DocumentOutline,
	WordCount,
	TimeToRead,
	CharacterCount,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../store';

export default function ListViewSidebar() {
	const { headingCount } = useSelect( ( select ) => {
		const { getGlobalBlockCount } = select( blockEditorStore );
		return {
			headingCount: getGlobalBlockCount( 'core/heading' ),
		};
	}, [] );
	const { setIsListViewOpened } = useDispatch( editPostStore );

	const focusOnMountRef = useFocusOnMount( 'firstElement' );
	const headerFocusReturnRef = useFocusReturn();
	const contentFocusReturnRef = useFocusReturn();
	function closeOnEscape( event ) {
		if ( event.keyCode === ESCAPE && ! event.defaultPrevented ) {
			event.preventDefault();
			setIsListViewOpened( false );
		}
	}

	const [ tab, setTab ] = useState( 'list-view' );
	useEffect( () => {
		if ( headingCount === 0 && tab === 'outline' ) {
			setTab( 'list-view' );
		}
	}, [ headingCount === 0, tab ] );

	return (
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions
		<div
			aria-label={ __( 'List View' ) }
			className="edit-post-editor__list-view-panel"
			onKeyDown={ closeOnEscape }
		>
			<div
				className="edit-post-editor__list-view-panel-header components-panel__header edit-post-sidebar__panel-tabs"
				ref={ headerFocusReturnRef }
			>
				<Button
					icon={ closeSmall }
					label={ __( 'Close List View Sidebar' ) }
					onClick={ () => setIsListViewOpened( false ) }
				/>
				<ul>
					<li>
						<Button
							onClick={ () => {
								setTab( 'list-view' );
							} }
							className={ classnames(
								'edit-post-sidebar__panel-tab',
								{ 'is-active': tab === 'list-view' }
							) }
							aria-current={ tab === 'list-view' }
						>
							{ __( 'List View' ) }
						</Button>
					</li>
					{ headingCount > 0 && (
						<li>
							<Button
								onClick={ () => {
									setTab( 'outline' );
								} }
								className={ classnames(
									'edit-post-sidebar__panel-tab',
									{ 'is-active': tab === 'outline' }
								) }
								aria-current={ tab === 'outline' }
							>
								{ __( 'Outline' ) }
							</Button>
						</li>
					) }
				</ul>
			</div>
			<div
				ref={ useMergeRefs( [
					contentFocusReturnRef,
					focusOnMountRef,
				] ) }
				className="edit-post-editor__list-view-container"
			>
				{ tab === 'list-view' && (
					<div className="edit-post-editor__list-view-panel-content">
						<ListView />
					</div>
				) }
				{ tab === 'outline' && <DocumentOutline /> }
				<div className="edit-post-editor__list-view-overview">
					<div>
						<Text>{ __( 'Characters:' ) }</Text>
						<Text>
							<CharacterCount />
						</Text>
					</div>
					<div>
						<Text>{ __( 'Words:' ) }</Text>
						<WordCount />
					</div>
					<div>
						<Text>{ __( 'Time to read:' ) }</Text>
						<TimeToRead />
					</div>
				</div>
			</div>
		</div>
	);
}
